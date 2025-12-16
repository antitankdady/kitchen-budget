export type Category = "meat" | "fish" | "vegetable" | "eatingout" | "general";

export interface Expense {
    id: string;
    date: string;       // YYYY-MM-DD
    amount: number;
    category: Category;
    ratio: number;      // 0〜100
    taxRate?: number;   // 0.08 または 0.10
    memo?: string;
    createdAt: string;
    updatedAt: string;
}
