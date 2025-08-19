import JWT from "../utils/JsonWebToken.js";

export const JWTInstance = new JWT(process.env.JWT_SECRET, "1h");
