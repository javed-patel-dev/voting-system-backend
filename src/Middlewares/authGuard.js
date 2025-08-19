import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { JWTInstance } from "../utils/JWT.js";
import { CustomError } from "../utils/customError.js";
import { get, set } from "lodash-es";

export const authGuard = async (req, res, next) => {
  try {
    const { headers: { authorization } } = req;

    if (!authorization) throw Error(ReasonPhrases.UNAUTHORIZED);
    
    const token = authorization.split(" ");

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
