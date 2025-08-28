import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { CustomError } from "../utils/customError.js";
export const notFoundHandler = (req, res, next) => {
  return next(
    new CustomError(
      StatusCodes.NOT_FOUND,
      ReasonPhrases.NOT_FOUND,
      "TOASTER_ERROR",
      req.requestId,
      req.requestEpoch,
      "The requested resource was not found"
    )
  );
};
