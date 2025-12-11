import { Router } from "express";

import {
  getExpensesController,
  createExpenseController,
  updateExpenseController,
  deleteExpenseController,
} from "../controllers/expensesController";

import { authenticateUser } from "../middleware/userMiddleware";

export const basePath = "/expenses";

const router = Router();

router.get("/", authenticateUser, getExpensesController);
router.post("/", authenticateUser, createExpenseController);
router.patch("/:id", authenticateUser, updateExpenseController);
router.delete("/:id", authenticateUser, deleteExpenseController);

export default router;
