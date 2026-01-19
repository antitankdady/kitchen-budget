export const CATEGORIES = {
    general: '全般',
    meat: '肉',
    fish: '魚',
    vegetable: '野菜',
    eatingout: '外食',
} as const;

export type Category = keyof typeof CATEGORIES;
