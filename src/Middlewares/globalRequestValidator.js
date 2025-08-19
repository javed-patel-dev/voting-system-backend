import { ReasonPhrases, StatusCodes } from "http-status-codes";
import * as Yup from "yup";

import { CustomError } from "../utils/CustomError.js";

export const globalRequestValidator = (schema) => async (req, res, next) => {
  try {
    if (!schema || !Yup.isSchema(schema)) return next();

    req.body = await schema.validate(req.body, {
      abortEarly: false,
      strict: false,
      stripUnknown: true,
    });

    next();
  } catch (error) {
    next(
      new CustomError(
        StatusCodes.BAD_REQUEST,
        ReasonPhrases.BAD_REQUEST,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};
