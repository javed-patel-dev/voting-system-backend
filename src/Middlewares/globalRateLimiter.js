import rateLimit from "express-rate-limit";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { get } from "lodash-es";

export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS || "1000", 10), // 1 second
  max: parseInt(process.env.GLOBAL_RATE_LIMIT || "10", 10), // 10 requests
  keyGenerator: (req, res) => {
    const userToken = get(req, "headers.authorization");
    const userId = get(req, "decodedUser.id");
    const ip = get(req, "clientIp");
    const path = get(req, "path");

    const identity = userToken
      ? `TOKEN_${userToken}`
      : userId
      ? `USER_ID_${userId}`
      : `IP_${ip}`;

    return `${identity}_${path}`;
  },
  message: {
    status: StatusCodes.TOO_MANY_REQUESTS,
    error: ReasonPhrases.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => req.path.includes("/internal"),
});
