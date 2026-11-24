import type { Category } from './constants';
export type { Category } from './constants';

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

// CSV取り込み方法（merge: 追加・更新、replace: 置き換え）
export type ImportMode = 'merge' | 'replace';

// CSV取り込み結果の件数
export interface ImportSummary {
    added: number;
    updated: number;
    unchanged: number;
}
