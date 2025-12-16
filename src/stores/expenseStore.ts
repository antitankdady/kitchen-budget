import { defineStore } from 'pinia';
import type { Expense, Category } from '../types';

const STORAGE_KEY = 'food_expense_app_v1';

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
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
        setFilter(startDate: string, endDate: string, category: Category | 'all') {
            this.filterState = { startDate, endDate, category };
        }
    }
});
