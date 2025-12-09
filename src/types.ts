export type Category = "meat" | "fish" | "vegetable" | "eatingout" | "general";

export interface Expense {
    id: string;
    date: string;       // YYYY-MM-DD
    amount: number | null;
    category: Category;
    ratio: number;      // 0〜100
    memo?: string;
    createdAt: string;
    updatedAt: string;
}
