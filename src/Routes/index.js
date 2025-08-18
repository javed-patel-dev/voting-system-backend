import { Router } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const router = Router();

import v1Routes from "./v1/index.js";

router.use(`/health-check`, async (req, res) => {
  res.customResponse(
    StatusCodes.OK,
    {
      statusCode: StatusCodes.OK,
      status: ReasonPhrases.OK,
    },
    true,
    req.requestId,
    req.requestEpoch
  );
});

router.use(`/v1`, v1Routes);

export default router;
