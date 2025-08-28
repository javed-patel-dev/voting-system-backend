import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/customError.js";

export const errorHandler = (err, req, res, next) => {
  let status = StatusCodes.INTERNAL_SERVER_ERROR;
  let payload = {
    success: false,
    message: ReasonPhrases.INTERNAL_SERVER_ERROR,
  };

  if (err instanceof CustomError) {
    status = err.HttpStatusCode;
    payload = err.JSON;
  } else {
    status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    payload = {
      success: false,
      message: err.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
      ...(process.env.NODE_ENV === "DEV" && { stack: err.stack }),
    };
  }

  res.status(status).json(payload);
};
