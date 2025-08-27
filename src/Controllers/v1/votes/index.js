import moment from "moment";
import { VoteService, PollService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";

export const create = async (req, res, next) => {
  try {
    const { body, decodedUser } = req;

    const poll = await PollService.findOne({ _id: get(body, "pollId") });

    if (!poll) {
      return res.customResponse(
        StatusCodes.NOT_FOUND,
        "Poll not found",
        false,
        req.requestId,
        req.requestEpoch
      );
    }

    const currentDate = moment();

    if (currentDate.isBefore(get(poll, "startDate"))) {
      return res.customResponse(
        StatusCodes.BAD_REQUEST,
        "Poll has not started yet",
        false,
        req.requestId,
        req.requestEpoch
      );
    }

    if (currentDate.isAfter(get(poll, "endDate"))) {
      return res.customResponse(
        StatusCodes.BAD_REQUEST,
        "Poll has already ended",
        false,
        req.requestId,
        req.requestEpoch
      );
    }

    await VoteService.create({
        ...body,
        voter: get(decodedUser, "id"),
      });

    return res.customResponse(
      StatusCodes.CREATED,
      ReasonPhrases.CREATED,
      true,
      req.requestId,
      req.requestEpoch
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "Voter already caste his vote",
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

    await VoteService.destroy({ _id: id });

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
