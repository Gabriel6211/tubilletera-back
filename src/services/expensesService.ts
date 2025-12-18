import * as admin from "firebase-admin";

import { Expense, ExpenseData } from "../types/expense";

const db = admin.firestore();

const COLLECTION_NAME = "expenses";

export const getExpenses = async (userId: string) => {
  try {
    const expenses = await db
      .collection(COLLECTION_NAME)
      .where("ownerId", "==", userId)
      .get();
    if (expenses.empty) {
      return {
        status: "success",
        code: 404,
        message: "No expenses found",
      };
    }
    return {
      status: "success",
      code: 200,
      message: "Expenses found",
      expenses: expenses.docs.map((doc) => doc.data()),
    };
  } catch (error) {
    console.error("Error getting expenses:", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to get expenses",
      details: (error as Error).message,
    };
  }
};

export const createExpense = async (expenseData: ExpenseData) => {
  try {
    const expenseRef = db.collection(COLLECTION_NAME).doc();
    await expenseRef.set({
      ...expenseData,
      id: expenseRef.id,
      uid: expenseRef.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const expenseDoc = await expenseRef.get();
    const expenseDataWithId = {
      id: expenseDoc.id,
      ...expenseDoc.data(),
    };
    return {
      status: "success",
      code: 200,
      message: "Expense created successfully",
      expense: expenseDataWithId,
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to create expense",
      details: (error as Error).message,
    };
  }
};

export const updateExpense = async (
  expenseData: ExpenseData,
  expenseId: string,
  userId: string
) => {
  try {
    const expenseRef = db.collection(COLLECTION_NAME).doc(expenseId);
    const expense = await expenseRef.get();
    if (!expense.exists) {
      return {
        status: "error",
        code: 404,
        message: "Expense not found",
      };
    }
    if (expense.data()?.ownerId !== userId) {
      return {
        status: "error",
        code: 403,
        message: "You are not authorized to update this expense",
      };
    }
    await expenseRef.update({
      ...expenseData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updatedExpenseDoc = await expenseRef.get();
    const updatedExpenseData = {
      id: updatedExpenseDoc.id,
      ...updatedExpenseDoc.data(),
    };
    return {
      status: "success",
      code: 200,
      message: "Expense updated successfully",
      expense: updatedExpenseData,
    };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to update expense",
      details: (error as Error).message,
    };
  }
};

export const deleteExpense = async (expenseId: string, userId: string) => {
  try {
    const expenseRef = db.collection(COLLECTION_NAME).doc(expenseId);
    const expense = await expenseRef.get();
    if (!expense.exists) {
      return {
        status: "error",
        code: 404,
        message: "Expense not found",
      };
    }
    if (expense.data()?.ownerId !== userId) {
      return {
        status: "error",
        code: 403,
        message: "You are not authorized to delete this expense",
      };
    }
    await expenseRef.delete();
    return {
      status: "success",
      code: 200,
      message: "Expense deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to delete expense",
      details: (error as Error).message,
    };
  }
};
