import { Router } from "express";

import UserRoutes from "./user/index.js";

const router = Router();

router.use("/users", UserRoutes);

export default router;
