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
    if (!expenseData) {
      return res.status(500).json({
        status: "error",
        message: "You need a valid expense to create",
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
    const expenseData: ExpenseData = req.body;
    if (!expenseData) {
      return res.status(500).json({
        status: "error",
        message: "You need a valid expense to update",
      });
    }
    const expenseId = req.params.id;
    if (!expenseId) {
      return res.status(500).json({
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
    const updatedExpense = await updateExpense(expenseData, expenseId, userId);
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
      return res.status(500).json({
        status: "error",
        message: "You need an expense ID to delete",
      });
    }
    const deletedExpense = await deleteExpense(expenseId);
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
