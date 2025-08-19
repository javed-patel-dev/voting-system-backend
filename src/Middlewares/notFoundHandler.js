import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { get } from "lodash-es";

import { CustomError } from "../utils/CustomError.js";

export const notFoundHandler = (req, res, next) => {
  return next(
    new CustomError(
      StatusCodes.NOT_FOUND,
      ReasonPhrases.NOT_FOUND,
      "TOASTER_ERROR",
      req.requestId,
      req.requestEpoch
    )
  );
};
