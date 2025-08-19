import { Logger } from "../../../Middlewares/Logger.js";
import { UserService } from "../../../services/index.js";
import { CustomError } from "../../../utils/CustomError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";

export const list = async (req, res, next) => {
  try {
    const { body } = req;

    const { data, total } = await UserService.findAndCountAll(
      get(body, "filter", {}),
      get(body, "sort", {}),
      get(body, "page", 1),
      get(body, "limit", 10)
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
        req.requestEpoch
      )
    );
  }
};

export const getById = async (req, res, next) => {
  try {
    const {
      params: { id },
    } = req;

    const data = await UserService.findOne({ _id: id });

    return res.customResponse(
      StatusCodes.OK,
      data,
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

export const create = async (req, res, next) => {
  try {
    const { body } = req;

    const data = await UserService.create(body);

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
          "Email already exists",
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

export const update = async (req, res, next) => {
  try {
    const {
      params: { id },
      body,
    } = req;

    await UserService.updateOne({ _id: id }, body);

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

export const destroy = async (req, res, next) => {
  try {
    const {
      params: { id },
    } = req;

    await UserService.destroy({ _id: id });

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
