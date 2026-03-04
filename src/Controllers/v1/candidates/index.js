import { CandidateService, PollService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";
import mongoose from "mongoose";

/**
 * List all candidates with optional filtering and pagination
 */
export const list = async (req, res, next) => {
  try {
    const { body } = req;
    const { filter, sort, page, limit, projection } = body;

    const queryFilter = {};

    // Filter by pollId if provided
    if (get(filter, "pollId")) {
      queryFilter.pollId = new mongoose.Types.ObjectId(get(filter, "pollId"));
    }

    // Search in manifesto
    if (get(filter, "search")) {
      queryFilter.manifesto = { $regex: get(filter, "search"), $options: "i" };
    }

    const { data, total } = await CandidateService.findAndCountAll(
      queryFilter,
      sort || { createdAt: -1 },
      page || 1,
      limit || 10,
      projection,
    );

    return res.customResponse(
      StatusCodes.OK,
      { data, total },
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

/**
 * Get candidates for a specific poll (public endpoint)
 */
export const listByPoll = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const candidates = await CandidateService.findByPollWithUser(pollId);

    return res.customResponse(
      StatusCodes.OK,
      candidates,
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

/**
 * Register as a candidate for a poll
 * - Poll must be in UPCOMING status
 * - User cannot already be registered as candidate in this poll
 * - User role remains VOTER (candidate status is poll-contextual)
 */
export const create = async (req, res, next) => {
  try {
    const { body, decodedUser } = req;
    const pollId = get(body, "pollId");
    const manifesto = get(body, "manifesto");
    const userId = get(decodedUser, "id");

    // Validate required fields
    if (!pollId || !manifesto) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Poll ID and manifesto are required",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check if poll exists
    const poll = await PollService.findOne({ _id: pollId });
    if (!poll) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "Poll not found",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check poll status - candidates can only register during UPCOMING phase
    const currentStatus = poll.computeStatus();
    if (currentStatus !== "UPCOMING") {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          `Candidate registration is only allowed during the upcoming phase. Current status: ${currentStatus}`,
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check if user is already a candidate in this poll
    const existingCandidate = await CandidateService.findOne({
      userId,
      pollId,
    });
    if (existingCandidate) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "You are already registered as a candidate for this poll",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Create candidate registration
    const candidate = await CandidateService.create({
      userId,
      pollId,
      manifesto: manifesto.trim(),
    });

    return res.customResponse(
      StatusCodes.CREATED,
      {
        message: "Successfully registered as a candidate",
        candidate,
      },
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "You are already registered as a candidate for this poll",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
          error,
        ),
      );
    }

    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

/**
 * Update candidate manifesto (only during UPCOMING phase)
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { manifesto } = req.body;
    const userId = get(req, "decodedUser.id");

    // Find the candidate
    const candidate = await CandidateService.findOne({ _id: id });
    if (!candidate) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "Candidate registration not found",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check if the user owns this candidate registration
    if (candidate.userId.toString() !== userId) {
      return next(
        new CustomError(
          StatusCodes.FORBIDDEN,
          "You can only update your own candidate registration",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check poll status
    const poll = await PollService.findOne({ _id: candidate.pollId });
    const currentStatus = poll.computeStatus();
    if (currentStatus !== "UPCOMING") {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Candidate information can only be updated during the upcoming phase",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Update manifesto
    await CandidateService.updateOne(
      { _id: id },
      { manifesto: manifesto.trim() },
    );

    return res.customResponse(
      StatusCodes.OK,
      "Candidate information updated successfully",
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

/**
 * Withdraw candidacy (only during UPCOMING phase)
 */
export const withdraw = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = get(req, "decodedUser.id");

    // Find the candidate
    const candidate = await CandidateService.findOne({ _id: id });
    if (!candidate) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "Candidate registration not found",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check if the user owns this candidate registration
    if (candidate.userId.toString() !== userId) {
      return next(
        new CustomError(
          StatusCodes.FORBIDDEN,
          "You can only withdraw your own candidacy",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check poll status
    const poll = await PollService.findOne({ _id: candidate.pollId });
    const currentStatus = poll.computeStatus();
    if (currentStatus !== "UPCOMING") {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Candidacy can only be withdrawn during the upcoming phase",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    await CandidateService.destroy({ _id: id });

    return res.customResponse(
      StatusCodes.OK,
      "Candidacy withdrawn successfully",
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

/**
 * Admin: Delete a candidate registration
 */
export const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const candidate = await CandidateService.findOne({ _id: id });
    if (!candidate) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "Candidate registration not found",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    await CandidateService.destroy({ _id: id });

    return res.customResponse(
      StatusCodes.OK,
      "Candidate deleted successfully",
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

/**
 * Check if current user is a candidate in a specific poll
 */
export const checkCandidateStatus = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const userId = get(req, "decodedUser.id");

    const candidate = await CandidateService.findOne({
      userId,
      pollId,
    });

    return res.customResponse(
      StatusCodes.OK,
      {
        isCandidate: !!candidate,
        candidate: candidate || null,
      },
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};
