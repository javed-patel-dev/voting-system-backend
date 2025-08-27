import { Router } from "express";

import AuthRoutes from "./auth/index.js";
import UserRoutes from "./users/index.js";
import PollRoutes from "./polls/index.js";
import CandidateRoutes from "./candidates/index.js";
import VoteRoutes from "./votes/index.js";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/candidates", CandidateRoutes);
router.use("/polls", PollRoutes);
router.use("/users", UserRoutes);
router.use("/votes", VoteRoutes);

export default router;
