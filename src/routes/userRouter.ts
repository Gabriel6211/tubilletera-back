import { Router } from "express";
import {
  createUserController,
  getUserController,
} from "../controllers/userController";
import { authenticateUser } from "../middleware/userMiddleware";

export const basePath = "/users";

const router = Router();

// Attach the authentication middleware before the controller
router.post("/", authenticateUser, createUserController);
router.get("/:id", getUserController);

export default router;
