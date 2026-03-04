import { UserService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { get } from "lodash-es";
import { encrypt } from "../../../utils/encrypt.js";
import { verifyOtp } from "../../../services/otp/index.js";

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
      projection,
    );

    return res.customResponse(
      StatusCodes.OK,
      { data, total },
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

export const create = async (req, res, next) => {
  try {
    const { body } = req;

    const { success } = await verifyOtp(
      get(body, "email"),
      "REGISTER",
      get(body, "otp"),
    );

    if (!success) {
      return next(
        new CustomError(
          StatusCodes.UNAUTHORIZED,
          "Session expired to create user. Please verify OTP again.",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    body.password = await encrypt.hash(get(body, "password", ""));
    await UserService.create(body);

    return res.customResponse(
      StatusCodes.CREATED,
      "User created successfully",
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new CustomError(
          StatusCodes.CONFLICT,
          "Email already exists",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
          error,
        ),
      );
    }

    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
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
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
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
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

// Get current user's profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = get(req, "user._id");

    const user = await UserService.findOne(
      { _id: userId },
      { password: 0 }, // Exclude password
    );

    if (!user) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "User not found",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    return res.customResponse(
      StatusCodes.OK,
      user,
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

// Update current user's profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = get(req, "user._id");
    const { name, bio, avatar } = req.body;

    // Only allow updating certain fields
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await UserService.updateOne(
      { _id: userId },
      updateData,
      { new: true, select: "-password" },
    );

    if (!updatedUser) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "User not found",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    return res.customResponse(
      StatusCodes.OK,
      updatedUser,
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = get(req, "user._id");
    const { currentPassword, newPassword } = req.body;

    const user = await UserService.findOne({ _id: userId });

    if (!user) {
      return next(
        new CustomError(
          StatusCodes.NOT_FOUND,
          "User not found",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Verify current password
    const isValidPassword = await encrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      return next(
        new CustomError(
          StatusCodes.UNAUTHORIZED,
          "Current password is incorrect",
          "TOASTER",
          req.requestId,
          req.requestEpoch,
        ),
      );
    }

    // Hash and update new password
    const hashedPassword = await encrypt.hash(newPassword);
    await UserService.updateOne({ _id: userId }, { password: hashedPassword });

    return res.customResponse(
      StatusCodes.OK,
      "Password changed successfully",
      true,
      req.requestId,
      req.requestEpoch,
    );
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error,
      ),
    );
  }
};
