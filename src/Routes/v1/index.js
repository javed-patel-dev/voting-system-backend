import { Router } from "express";

import AuthRoutes from "./auth/index.js";
import UserRoutes from "./users/index.js";
import PollRoutes from "./polls/index.js";
import CandidateRoutes from "./candidates/index.js";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/polls", PollRoutes);
router.use("/candidates", CandidateRoutes);

export default router;
