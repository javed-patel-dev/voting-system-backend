import { AnalyticService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";

export const listPollsWithCandidateDetails = async (req, res, next) => {
  try {
    const { body } = req;

    const { count, data } = await AnalyticService.listPollWithCandidate(
      get(body, "filter", {}),
      get(body, "sort", { voteCount: -1 }),
      get(body, "page", 1),
      get(body, "limit", 10),
    );

    return res.customResponse(
      StatusCodes.OK,
      {
        count,
        data,
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

export const listCandidateWithVoterDetails = async (req, res, next) => {
  try {
    const { body } = req;

    const { count, data } = await AnalyticService.listCandidatesWithVoters(
      get(body, "filter", {}),
      get(body, "sort", { createdAt: -1 }),
      get(body, "page", 1),
      get(body, "limit", 10),
    );

    return res.customResponse(
      StatusCodes.OK,
      {
        count,
        data,
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

export const listAnalytics = async (req, res, next) => {
  try {
    const {
      body: { filter, sort, page, limit, projection },
    } = req;
    const { data, total } = await AnalyticService.listAnalytics(
      filter,
      sort,
      page,
      limit,
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

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await AnalyticService.getDashboardStats();

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
 * Get voters for a specific candidate (Admin only)
 */
export const getVotersForCandidate = async (req, res, next) => {
  try {
    const { pollId, candidateId } = req.params;
    const { page, limit } = req.query;

    const { voters, total } = await AnalyticService.getVotersForCandidate(
      pollId,
      candidateId || null,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );

    return res.customResponse(
      StatusCodes.OK,
      { voters, total },
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
 * Get voting timeline for a poll (Admin only)
 */
export const getVotingTimeline = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const timeline = await AnalyticService.getVotingTimeline(pollId);

    return res.customResponse(
      StatusCodes.OK,
      timeline,
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
 * Get user's voting history
 */
export const getUserVotingHistory = async (req, res, next) => {
  try {
    const userId = get(req, "decodedUser.id");
    const { page, limit } = req.query;

    const { votes, total } = await AnalyticService.getUserVotingHistory(
      userId,
      parseInt(page) || 1,
      parseInt(limit) || 10,
    );

    return res.customResponse(
      StatusCodes.OK,
      { votes, total },
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
 * Get user's candidate history (polls they participated in as candidate)
 */
export const getUserCandidateHistory = async (req, res, next) => {
  try {
    const userId = get(req, "decodedUser.id");

    const history = await AnalyticService.getUserCandidateHistory(userId);

    return res.customResponse(
      StatusCodes.OK,
      history,
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
