import {
  PollService,
  VoteService,
  CandidateService,
  UserService,
} from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";
import { mailer } from "../../../utils/mailer.js";

/**
 * List all polls with filtering and pagination
 */
export const list = async (req, res, next) => {
  try {
    const { body } = req;
    const { filter, sort, page, limit, projection } = body;

    const queryFilter = {};

    // Search filter
    if (get(filter, "search")) {
      queryFilter.$or = [
        { title: { $regex: get(filter, "search"), $options: "i" } },
        { description: { $regex: get(filter, "search"), $options: "i" } },
      ];
    }

    // Status filter
    if (get(filter, "status")) {
      queryFilter.status = get(filter, "status");
    }

    // Title filter
    if (get(filter, "title")) {
      queryFilter.title = { $regex: get(filter, "title"), $options: "i" };
    }

    const { data, total } = await PollService.findAndCountAll(
      queryFilter,
      sort || { createdAt: -1 },
      page || 1,
      limit || 10,
      projection,
    );

    // Compute real-time status for each poll
    const pollsWithStatus = data.map((poll) => {
      const pollObj = poll.toObject();
      pollObj.computedStatus = poll.computeStatus();
      return pollObj;
    });

    return res.customResponse(
      StatusCodes.OK,
      { data: pollsWithStatus, total },
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
 * Get poll detail by ID with computed status
 */
export const getDetailById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await PollService.getById(id);

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

    const pollObj = poll.toObject();
    pollObj.computedStatus = poll.computeStatus();

    return res.customResponse(
      StatusCodes.OK,
      pollObj,
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
 * Get complete poll details with candidates, votes, and results
 */
export const getFullPollDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await PollService.getById(id);

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

    // Get candidates and vote stats
    const [candidates, voteStats] = await Promise.all([
      CandidateService.findByPollWithUser(id),
      VoteService.getVoteCountsByCandidate(id),
    ]);

    // Build poll response
    const pollObj = poll.toObject();
    pollObj.computedStatus = poll.computeStatus();
    pollObj.candidatesCount = candidates.length;
    pollObj.totalVotes = voteStats.totalVotes;

    // Map vote counts to candidates
    const candidatesWithVotes = candidates.map((candidate) => {
      const candidateObj = candidate.toObject();
      const voteInfo = voteStats.candidates.find(
        (c) => c.candidateId.toString() === candidate._id.toString(),
      );
      candidateObj.voteCount = voteInfo?.voteCount || 0;
      candidateObj.percentage = voteInfo?.percentage || "0.0";
      return candidateObj;
    });

    // Sort by vote count (highest first)
    candidatesWithVotes.sort((a, b) => b.voteCount - a.voteCount);

    // Get winner info if results are declared
    let winner = null;
    if (poll.isResultDeclared && poll.winnerId) {
      winner = candidatesWithVotes.find(
        (c) => c._id.toString() === poll.winnerId.toString(),
      );
    }

    return res.customResponse(
      StatusCodes.OK,
      {
        poll: pollObj,
        candidates: candidatesWithVotes,
        winner,
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

/**
 * Create a new poll (Admin only)
 */
export const create = async (req, res, next) => {
  try {
    const { body } = req;

    // Set initial status based on dates
    const now = new Date();
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    // Validate dates
    if (startDate >= endDate) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "End date must be after start date",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    let status = "UPCOMING";
    if (now >= startDate && now < endDate) {
      status = "ACTIVE";
    } else if (now >= endDate) {
      status = "ENDED";
    }

    const poll = await PollService.create({
      ...body,
      status,
    });

    return res.customResponse(
      StatusCodes.CREATED,
      poll,
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "Poll with this title already exists",
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
 * Update a poll (Admin only)
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body } = req;

    const poll = await PollService.getById(id);
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

    // Don't allow updating if results are declared
    if (poll.isResultDeclared) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Cannot update poll after results are declared",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    await PollService.updateOne({ _id: id }, body);

    return res.customResponse(
      StatusCodes.OK,
      "Poll updated successfully",
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
 * Declare poll results (Admin only)
 * - Calculates winner based on vote counts
 * - Sends congratulation email to winner
 * - Marks poll as results declared
 */
export const declareResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = get(req, "decodedUser.id");

    const poll = await PollService.getById(id);
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

    // Check if results already declared
    if (poll.isResultDeclared) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Results have already been declared for this poll",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Get vote statistics
    const voteStats = await VoteService.getVoteCountsByCandidate(id);

    if (voteStats.candidates.length === 0) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Cannot declare results: No votes have been cast",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Find winner (candidate with most votes)
    const winner = voteStats.candidates[0]; // Already sorted by voteCount desc

    // Get winner's full candidate record
    const winnerCandidate = await CandidateService.findOne({
      _id: winner.candidateId,
    });
    const winnerUser = await UserService.findOne({
      _id: winnerCandidate.userId,
    });

    // Update poll with result
    await PollService.updateOne(
      { _id: id },
      {
        isResultDeclared: true,
        winnerId: winner.candidateId,
        declaredAt: new Date(),
        declaredBy: adminId,
        status: "ENDED",
      },
    );

    // Send congratulation email to winner
    try {
      await mailer.sendMail({
        to: winnerUser.email,
        subject: `🎉 Congratulations! You Won: ${poll.title}`,
        template: "winner",
        context: {
          name: winnerUser.name,
          pollTitle: poll.title,
          voteCount: winner.voteCount,
          totalVotes: voteStats.totalVotes,
          percentage: winner.percentage,
          declaredAt: new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      });
    } catch (emailError) {
      console.error("Failed to send winner email:", emailError);
      // Don't fail the request if email fails
    }

    return res.customResponse(
      StatusCodes.OK,
      {
        message: "Results declared successfully",
        winner: {
          userId: winnerUser._id,
          name: winnerUser.name,
          email: winnerUser.email,
          voteCount: winner.voteCount,
          percentage: winner.percentage,
        },
        totalVotes: voteStats.totalVotes,
        allResults: voteStats.candidates,
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

/**
 * Delete a poll (Admin only)
 * Also deletes associated candidates and votes
 */
export const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const poll = await PollService.getById(id);
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

    // Delete associated candidates and votes
    await Promise.all([
      CandidateService.destroyByPoll(id),
      VoteService.destroyByPoll(id),
      PollService.destroy({ _id: id }),
    ]);

    return res.customResponse(
      StatusCodes.OK,
      "Poll and all associated data deleted successfully",
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
