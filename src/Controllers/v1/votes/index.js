import {
  VoteService,
  PollService,
  CandidateService,
} from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";

/**
 * Cast a vote for a candidate in a poll
 * Validations:
 * - Poll must exist and be ACTIVE
 * - Voter cannot be a candidate in this poll
 * - Voter cannot have already voted in this poll
 * - Candidate must exist and belong to this poll
 */
export const create = async (req, res, next) => {
  try {
    const { body, decodedUser } = req;
    const pollId = get(body, "pollId");
    const candidateId = get(body, "candidateId");
    const voterId = get(decodedUser, "id");

    // Validate required fields
    if (!pollId || !candidateId) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Poll ID and Candidate ID are required",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Fetch poll, check if voter is a candidate, validate candidate exists
    const [poll, voterAsCandidate, targetCandidate, existingVote] =
      await Promise.all([
        PollService.findOne({ _id: pollId }),
        CandidateService.findOne({ userId: voterId, pollId }),
        CandidateService.findOne({ _id: candidateId, pollId }),
        VoteService.findOne({ voter: voterId, pollId }),
      ]);

    // Check if poll exists
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

    // Check if poll is active
    const currentStatus = poll.computeStatus();
    if (currentStatus === "UPCOMING") {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Voting has not started yet. Please wait until the poll becomes active.",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    if (currentStatus === "ENDED") {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "This poll has ended. Voting is no longer allowed.",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check if result is already declared
    if (poll.isResultDeclared) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          "Results have been declared. Voting is closed.",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check if voter is a candidate in this poll (candidates cannot vote in their own poll)
    if (voterAsCandidate) {
      return next(
        new CustomError(
          StatusCodes.FORBIDDEN,
          "Candidates cannot vote in polls they are participating in",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check if target candidate exists in this poll
    if (!targetCandidate) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "Candidate not found in this poll",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Check if voter has already voted
    if (existingVote) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "You have already cast your vote in this poll",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Create vote
    const vote = await VoteService.create({
      voter: voterId,
      candidateId,
      pollId,
    });

    return res.customResponse(
      StatusCodes.CREATED,
      {
        message: "Vote cast successfully!",
        vote: {
          _id: vote._id,
          pollId: vote.pollId,
          createdAt: vote.createdAt,
        },
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
          "You have already cast your vote in this poll",
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
 * Check if current user has voted in a specific poll
 */
export const checkVoteStatus = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const voterId = get(req, "decodedUser.id");

    const [vote, isCandidate] = await Promise.all([
      VoteService.findOne({ voter: voterId, pollId }),
      CandidateService.findOne({ userId: voterId, pollId }),
    ]);

    return res.customResponse(
      StatusCodes.OK,
      {
        hasVoted: !!vote,
        isCandidate: !!isCandidate,
        canVote: !vote && !isCandidate,
        votedAt: vote?.createdAt || null,
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
 * Get voting statistics for a poll (public - vote counts only)
 */
export const getPollStats = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const stats = await VoteService.getVoteCountsByCandidate(pollId);

    return res.customResponse(
      StatusCodes.OK,
      stats,
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
 * Admin: Delete a vote (for exceptional cases)
 */
export const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vote = await VoteService.findOne({ _id: id });
    if (!vote) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "Vote not found",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    await VoteService.destroy({ _id: id });

    return res.customResponse(
      StatusCodes.OK,
      "Vote deleted successfully",
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
