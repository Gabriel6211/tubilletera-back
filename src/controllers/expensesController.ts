import { Request, Response } from "express";
import { Expense, ExpenseData } from "../types/expense";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expensesService";

export const getExpensesController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(500).json({
        status: "error",
        message: "No user ID provided",
      });
    }
    const expenses = await getExpenses(userId);
    return res.status(expenses.code).json({
      ...expenses,
    });
  } catch (error) {
    console.error("Error getting expenses:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get expenses",
      details: (error as Error).message,
    });
  }
};

export const createExpenseController = async (req: Request, res: Response) => {
  try {
    const expenseData: ExpenseData = req.body;
    // Validate required fields - check if expenseData exists and has required properties
    if (
      !expenseData ||
      typeof expenseData.amount !== "number" ||
      !expenseData.description ||
      !expenseData.date ||
      !expenseData.category
    ) {
      return res.status(400).json({
        status: "error",
        message: "You need a valid expense to create. Required fields: amount, description, date, category",
      });
    }
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(500).json({
        status: "error",
        message: "No user ID provided",
      });
    }
    expenseData.ownerId = userId;
    const newExpense = await createExpense(expenseData);
    return res.status(newExpense.code).json({
      ...newExpense,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create expense",
      details: (error as Error).message,
    });
  }
};

export const updateExpenseController = async (req: Request, res: Response) => {
  try {
    const expenseData: Partial<ExpenseData> = req.body;
    // Validate that at least one field is provided for update
    if (
      !expenseData ||
      Object.keys(expenseData).length === 0 ||
      (expenseData.amount === undefined &&
        expenseData.description === undefined &&
        expenseData.date === undefined &&
        expenseData.category === undefined)
    ) {
      return res.status(400).json({
        status: "error",
        message: "You need at least one valid field to update (amount, description, date, or category)",
      });
    }
    // Validate that if amount is provided, it's a number
    if (expenseData.amount !== undefined && typeof expenseData.amount !== "number") {
      return res.status(400).json({
        status: "error",
        message: "Amount must be a number",
      });
    }
    const expenseId = req.params.id;
    if (!expenseId) {
      return res.status(400).json({
        status: "error",
        message: "You need an expense ID to update",
      });
    }
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(500).json({
        status: "error",
        message: "No user ID provided",
      });
    }
    const updatedExpense = await updateExpense(expenseData as ExpenseData, expenseId, userId);
    return res.status(updatedExpense.code).json({
      ...updatedExpense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update expense",
      details: (error as Error).message,
    });
  }
};

export const deleteExpenseController = async (req: Request, res: Response) => {
  try {
    const expenseId = req.params.id;
    if (!expenseId) {
      return res.status(400).json({
        status: "error",
        message: "You need an expense ID to delete",
      });
    }
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(500).json({
        status: "error",
        message: "No user ID provided",
      });
    }
    const deletedExpense = await deleteExpense(expenseId, userId);
    return res.status(deletedExpense.code).json({
      ...deletedExpense,
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete expense",
      details: (error as Error).message,
    });
  }
};
