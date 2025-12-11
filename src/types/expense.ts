export interface Expense {
  id: string;
  uid: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseData {
  amount: number;
  description: string;
  date: string;
  category: string;
  ownerId: string;
}
