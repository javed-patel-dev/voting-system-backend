import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/customError.js";

export const routeGuard = (allowedRoles) => async (req, res, next) => {
  try {
    const { decodedUser } = req;

    // Ensure allowedRoles is always an array
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!rolesArray.includes(decodedUser.role)) {
      throw new Error("User does not have the required role to access this resource");
    }

    return next();
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.FORBIDDEN,
        error.message || ReasonPhrases.FORBIDDEN,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};
