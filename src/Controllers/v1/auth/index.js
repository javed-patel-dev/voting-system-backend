import { UserService } from "../../../services/index.js";
import { CustomError } from "../../../utils/customError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { encrypt } from "../../../utils/encrypt.js";
import { JWTInstance } from "../../../utils/JWT.js";

export const login = async (req, res, next) => {
  try {
    const {
      body: { email, password },
    } = req;

    const user = await UserService.findOne({ email });

    if (!user) {
      return next(
        new CustomError(
          StatusCodes.UNAUTHORIZED,
          "Invalid email",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    const isMatch = await encrypt.compare(password, user.password);

    if (!isMatch) {
      return next(
        new CustomError(
          StatusCodes.UNAUTHORIZED,
          "Invalid password",
          "TOASTER",
          req.requestId,
          req.requestEpoch
        )
      );
    }

    const token = await JWTInstance.generateToken({ id: user._id, email: user.email, role: user.role });

    return res.customResponse(
      StatusCodes.OK,
      { token },
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
