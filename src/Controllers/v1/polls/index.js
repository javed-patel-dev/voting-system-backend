import { PollService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";

export const list = async (req, res, next) => {
  try {
    const { body } = req;
    const { filter, sort, page, limit, projection } = body;

    const { data, total } = await PollService.findAndCountAll(
      {
        ...(get(filter, "search") && {
          $or: [
            { _id: { $regex: get(filter, "search"), $options: "i" } },
            { title: { $regex: get(filter, "search"), $options: "i" } },
            { description: { $regex: get(filter, "search"), $options: "i" } },
            { startDate: { $regex: get(filter, "search"), $options: "i" } },
            { endDate: { $regex: get(filter, "search"), $options: "i" } },
          ],
        }),
        ...(get(filter, "title") && {
          title: { $regex: get(filter, "title"), $options: "i" },
        }),
        ...(get(filter, "description") && {
          description: { $regex: get(filter, "description"), $options: "i" },
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
        req.requestEpoch
      )
    );
  }
};

export const getDetailById = async (req, res, next) => {
  try {
    const {
      params: { id },
    } = req;

    const data = await PollService.getPollWithCandidates(id);

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

    const data = await PollService.create(body);

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

export const update = async (req, res, next) => {
  try {
    const {
      params: { id },
      body,
    } = req;

    await PollService.updateOne({ _id: id }, body);

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

    await PollService.destroy({ _id: id });

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
