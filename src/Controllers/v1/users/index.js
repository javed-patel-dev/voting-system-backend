import { CustomError } from "../../../utils/CustomError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const listUsers = async (req, res, next) => {
  try {
    const { body } = req;
    const { filter, sort, page, limit } = body;

    return res.customResponse(
      StatusCodes.OK,
      { data: [] },
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR,
        MESSAGE_TYPES.TOASTER,
        req.requestId,
        req.requestEpoch
      )
    );
  }
};
