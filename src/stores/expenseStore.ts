import { defineStore } from 'pinia';
import type { Expense, Category, ImportMode, ImportSummary } from '../types';

const STORAGE_KEY = 'food_expense_app_v1';

// a が b より新しく更新されているか
const isNewer = (a: Expense, b: Expense): boolean => Date.parse(a.updatedAt) > Date.parse(b.updatedAt);

// 同じidが複数ある場合は updatedAt が新しいものだけを残す
const dedupeById = (list: Expense[]): Expense[] => {
    const map = new Map<string, Expense>();
    for (const e of list) {
        const current = map.get(e.id);
        if (!current || isNewer(e, current)) map.set(e.id, e);
    }
    return [...map.values()];
};

export const useExpenseStore = defineStore('expense', {
    state: () => ({
        expenses: [] as Expense[],
        filterState: {
            startDate: '',
            endDate: '',
            category: 'all' as Category | 'all'
        }
    }),
    getters: {
        filteredExpenses: (state): Expense[] => {
            const { startDate, endDate, category } = state.filterState;
            return state.expenses.filter(expense => {
                const dateMatch = (!startDate || expense.date >= startDate) && (!endDate || expense.date <= endDate);
                const categoryMatch = !category || category === 'all' || expense.category === category;
                return dateMatch && categoryMatch;
            }).sort((a, b) => {
                const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
                if (dateDiff !== 0) return dateDiff;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        },
        totalAmount(): number {
            return this.filteredExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
        },
        myAmount(): number {
            return this.filteredExpenses.reduce((sum: number, expense: Expense) => sum + Math.ceil(expense.amount * (expense.ratio / 100)), 0);
        },
        getExpenseById: (state) => (id: string): Expense | undefined => {
            return state.expenses.find(e => e.id === id);
        }
    },
    actions: {
        loadFromLocalStorage() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    this.expenses = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to parse expenses from localStorage', e);
                    this.expenses = [];
                }
            }
        },
        saveToLocalStorage() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.expenses));
        },
        addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
            const now = new Date().toISOString();
            const newExpense: Expense = {
                ...expense,
                id: crypto.randomUUID(),
                createdAt: now,
                updatedAt: now,
            };
            this.expenses.push(newExpense);
            this.saveToLocalStorage();
        },
        updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>) {
            const index = this.expenses.findIndex(e => e.id === id);
            if (index !== -1) {
                const current = this.expenses[index];
                if (!current) return;

                this.expenses[index] = {
                    ...current,
                    ...updates,
                    id: current.id,
                    createdAt: current.createdAt,
                    updatedAt: new Date().toISOString(),
                } as Expense;
                this.saveToLocalStorage();
            }
        },
        deleteExpense(id: string) {
            this.expenses = this.expenses.filter(e => e.id !== id);
            this.saveToLocalStorage();
        },
        // CSVから読み込んだデータを取り込む
        importExpenses(incoming: Expense[], mode: ImportMode): ImportSummary {
            const list = dedupeById(incoming);

            if (mode === 'replace') {
                this.expenses = list;
                this.saveToLocalStorage();
                return { added: list.length, updated: 0, unchanged: 0 };
            }

            // マージ: idが一致すれば updatedAt が新しい方を採用し、なければ追加する
            const summary: ImportSummary = { added: 0, updated: 0, unchanged: 0 };
            const merged = [...this.expenses];
            const indexById = new Map(merged.map((e, i) => [e.id, i]));
            for (const e of list) {
                const index = indexById.get(e.id);
                const current = index === undefined ? undefined : merged[index];
                if (index === undefined || !current) {
                    indexById.set(e.id, merged.length);
                    merged.push(e);
                    summary.added++;
                } else if (isNewer(e, current)) {
                    merged[index] = e;
                    summary.updated++;
                } else {
                    summary.unchanged++;
                }
            }
            this.expenses = merged;
            this.saveToLocalStorage();
            return summary;
        },
        setFilter(startDate: string, endDate: string, category: Category | 'all') {
            this.filterState = { startDate, endDate, category };
        }
    }
});
