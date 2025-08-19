import { ReasonPhrases } from "http-status-codes";
import { JWTInstance } from "../utils/JWT.js";

export const authGuard = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ");

    if (token && token[0] === "Bearer" && token[1]) {
      const decryptedPayload = JWTInstance.verifyToken(
        token[1],
      );

      const userId = get(decryptedPayload, "id");

      // User ID not found.
      if (!userId) throw Error(ReasonPhrases.UNAUTHORIZED);

      // Inject User Data in decodedUser
      set(req, "decodedUser", decryptedPayload);

      return next();
    }
  } catch (error) {
    return next(
      new CustomError(
        StatusCodes.UNAUTHORIZED,
        error.message || ReasonPhrases.UNAUTHORIZED,
        "TOASTER",
        req.requestId,
        req.requestEpoch,
        error
      )
    );
  }
};
