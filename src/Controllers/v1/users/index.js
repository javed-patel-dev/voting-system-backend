import { UserService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";
import { encrypt } from "../../../utils/encrypt.js";

export const list = async (req, res, next) => {
  try {
    const { body } = req;
    const { filter, sort, page, limit, projection } = body;

    const { data, total } = await UserService.findAndCountAll(
      {
        ...(get(filter, "search") && {
          $or: [
            { _id: { $regex: get(filter, "search"), $options: "i" } },
            { name: { $regex: get(filter, "search"), $options: "i" } },
            { email: { $regex: get(filter, "search"), $options: "i" } },
          ],
        }),
        ...(get(filter, "email") && {
          email: { $regex: get(filter, "email"), $options: "i" },
        }),
        ...(get(filter, "role") && {
          role: get(filter, "role"),
        }),
        ...(get(filter, "id") && {
          _id: { $regex: get(filter, "id"), $options: "i" },
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
    const { body } = req;

    body.password = await encrypt.hash(get(body, "password", ""));
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
      console.log('are we here', error)
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "Email already exists",
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
        req.requestEpoch,
        error
      )
    );
  }
};
