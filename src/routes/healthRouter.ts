import { Router } from "express";

import { getHealth } from "../controllers/healthController";

export const basePath = "/api/health";

const router = Router();

router.get("/", getHealth);

export default router;
