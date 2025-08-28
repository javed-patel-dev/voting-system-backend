import { CandidateService, UserService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";

export const list = async (req, res, next) => {
  try {
    const { body } = req;
    const { filter, sort, page, limit, projection } = body;

    const { data, total } = await CandidateService.findAndCountAll(
      {
        ...(get(filter, "search") && {
          $or: [
            { _id: { $regex: get(filter, "search"), $options: "i" } },
            { pollId: { $regex: get(filter, "search"), $options: "i" } },
            { candidateId: { $regex: get(filter, "search"), $options: "i" } },
          ],
        }),
      },
      sort,
      page,
      limit,
      projection
    );

    return res.customResponse(
      StatusCodes.OK,
      { data, total },
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

export const create = async (req, res, next) => {
  try {
    const { body, decodedUser } = req;

    await Promise.all([
      CandidateService.create({
        ...body,
        userId: get(decodedUser, "id"),
      }),
      UserService.updateOne(
        { _id: get(decodedUser, "id") },
        { role: "CANDIDATE" }
      ),
    ]);

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
          "Candidate already registered to poll",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
          error
        )
      );
    }

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

export const destroy = async (req, res, next) => {
  try {
    const {
      params: { id },
    } = req;

    await CandidateService.destroy({ _id: id });

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
        req.requestEpoch,
        error
      )
    );
  }
};
