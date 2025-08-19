import { PollCandidateService } from "../../../services/index.js";
import { CustomError } from "../../../utils/CustomError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const create = async (req, res, next) => {
  try {
    const { body } = req;

    const data = await PollCandidateService.create(body);

    return res.customResponse(
      StatusCodes.CREATED,
      data,
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "title already exists",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch
      )
    );
  }
};

export const destroy = async (req, res, next) => {
  try {
    const {
      params: { id },
    } = req;

    await PollCandidateService.destroy({ _id: id });

    return res.customResponse(
      StatusCodes.OK,
      ReasonPhrases.OK,
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
        req.requestEpoch
      )
    );
  }
};
