import { VoteService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";

export const listWinnersOfElectionPerPolls = async (req, res, next) => {
  try {
    const { body } = req;

    const { count, data } = await VoteService.listWinners(
      get(body, "filter", {}),
      get(body, "sort", { voteCount: -1 }),
      get(body, "page", 1),
      get(body, "limit", 10),
      get(body, "projection", null)
    );

    return res.customResponse(
      StatusCodes.OK,
      {
        count,
        data,
      },
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};
