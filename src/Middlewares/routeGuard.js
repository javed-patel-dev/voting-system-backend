import { ReasonPhrases } from "http-status-codes";

export const routeGuard = (userRole) => async (req, res, next) => {
  try {
    const { decodedUser } = req;

    if (decodedUser.role !== userRole) {
      throw new Error(ReasonPhrases.FORBIDDEN);
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
