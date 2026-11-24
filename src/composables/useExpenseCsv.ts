import type { Expense, Category } from '../types';
import { CATEGORIES } from '../constants';

// 出力時の列順（取り込み時は列名で判定するため順不同）
const CSV_COLUMNS = ['id', 'date', 'amount', 'category', 'ratio', 'taxRate', 'memo', 'createdAt', 'updatedAt'] as const;
type CsvColumn = typeof CSV_COLUMNS[number];

// 取り込みに必須の列
const REQUIRED_COLUMNS: readonly CsvColumn[] = ['date', 'amount', 'category', 'ratio'];

// 行単位の取り込みエラー
export interface CsvRowError {
    line: number;
    message: string;
}

// CSV解析結果（ファイル全体が読めない場合は ok: false）
export type CsvParseResult =
    | { ok: true; expenses: Expense[]; errors: CsvRowError[] }
    | { ok: false; message: string };

// CSVの1レコード（開始行番号付き）
interface CsvRecord {
    line: number;
    cells: string[];
}

// ---------- 出力 ----------

// 値をCSV用にエスケープする
const escapeCell = (value: string): string => {
    if (/[",\r\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
};

// 支出データをCSV文字列に変換する（BOMは含まない）
export const expensesToCsv = (expenses: Expense[]): string => {
    const lines = [CSV_COLUMNS.join(',')];
    for (const e of expenses) {
        const row: Record<CsvColumn, string> = {
            id: e.id,
            date: e.date,
            amount: String(e.amount),
            category: e.category,
            ratio: String(e.ratio),
            taxRate: e.taxRate ? String(e.taxRate) : '',
            memo: e.memo ?? '',
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
        };
        lines.push(CSV_COLUMNS.map(col => escapeCell(row[col])).join(','));
    }
    return lines.join('\r\n') + '\r\n';
};

// 出力ファイル名を作る（kitchen-budget_YYYYMMDD_HHmm.csv）
export const buildCsvFileName = (now: Date = new Date()): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const ymd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const hm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `kitchen-budget_${ymd}_${hm}.csv`;
};

// ---------- 取り込み ----------

// CSV文字列をレコードに分解する（ダブルクォート内のカンマ・改行に対応）
const splitCsv = (source: string): CsvRecord[] => {
    const text = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
    const records: CsvRecord[] = [];
    let cells: string[] = [];
    let field = '';
    let inQuotes = false;
    let line = 1;
    let recordLine = 1;

    for (let i = 0; i < text.length; i++) {
        const c = text.charAt(i);

        if (inQuotes) {
            if (c === '"') {
                if (text.charAt(i + 1) === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                if (c === '\n') line++;
                field += c;
            }
            continue;
        }

        if (c === '"') {
            inQuotes = true;
        } else if (c === ',') {
            cells.push(field);
            field = '';
        } else if (c === '\r' || c === '\n') {
            if (c === '\r' && text.charAt(i + 1) === '\n') i++;
            cells.push(field);
            records.push({ line: recordLine, cells });
            cells = [];
            field = '';
            line++;
            recordLine = line;
        } else {
            field += c;
        }
    }

    // 末尾に改行がない場合の最終レコード
    if (field !== '' || cells.length > 0) {
        cells.push(field);
        records.push({ line: recordLine, cells });
    }
    return records;
};

// 日付を検証し YYYY-MM-DD に正規化する（YYYY/M/D も許可）
const normalizeDate = (raw: string): string | null => {
    const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(raw);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
    return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

// カテゴリをキーに変換する（キー・表示名のどちらも許可）
const normalizeCategory = (raw: string): Category | null => {
    const keys = Object.keys(CATEGORIES) as Category[];
    return keys.find(key => key === raw || CATEGORIES[key] === raw) ?? null;
};

// 日時を検証し ISO 文字列に正規化する（不正・空欄は代替値）
const normalizeDateTime = (raw: string, fallback: string): string => {
    if (!raw) return fallback;
    const time = Date.parse(raw);
    return Number.isNaN(time) ? fallback : new Date(time).toISOString();
};

// CSV文字列を支出データに変換する
export const parseExpenseCsv = (source: string): CsvParseResult => {
    const records = splitCsv(source).filter(r => r.cells.some(cell => cell.trim() !== ''));
    const header = records.shift();
    if (!header) {
        return { ok: false, message: 'データが空です。' };
    }

    // 列名（大文字小文字は区別しない）から列位置を特定する
    const columnIndex = new Map<CsvColumn, number>();
    header.cells.forEach((name, index) => {
        const col = CSV_COLUMNS.find(c => c.toLowerCase() === name.trim().toLowerCase());
        if (col && !columnIndex.has(col)) columnIndex.set(col, index);
    });
    const missing = REQUIRED_COLUMNS.filter(col => !columnIndex.has(col));
    if (missing.length > 0) {
        return { ok: false, message: `必須の列がありません: ${missing.join(', ')}` };
    }

    const now = new Date().toISOString();
    const expenses: Expense[] = [];
    const errors: CsvRowError[] = [];

    for (const record of records) {
        const get = (col: CsvColumn): string => {
            const index = columnIndex.get(col);
            return index === undefined ? '' : (record.cells[index] ?? '').trim();
        };
        const fail = (message: string) => errors.push({ line: record.line, message });

        const date = normalizeDate(get('date'));
        if (!date) { fail(`日付が不正です（${get('date') || '空欄'}）`); continue; }

        const amountRaw = get('amount');
        if (!/^\d+$/.test(amountRaw)) { fail(`金額が不正です（${amountRaw || '空欄'}）`); continue; }

        const category = normalizeCategory(get('category'));
        if (!category) { fail(`カテゴリが不正です（${get('category') || '空欄'}）`); continue; }

        const ratioRaw = get('ratio');
        const ratio = Number(ratioRaw);
        if (!/^\d+$/.test(ratioRaw) || ratio > 100) { fail(`負担割合が不正です（${ratioRaw || '空欄'}）`); continue; }

        const taxRaw = get('taxRate');
        let taxRate: number | undefined;
        if (taxRaw !== '') {
            const tax = Number(taxRaw);
            if (tax !== 0.08 && tax !== 0.1) { fail(`税率が不正です（${taxRaw}）`); continue; }
            taxRate = tax;
        }

        const memo = get('memo');
        const expense: Expense = {
            id: get('id') || crypto.randomUUID(),
            date,
            amount: Number(amountRaw),
            category,
            ratio,
            createdAt: normalizeDateTime(get('createdAt'), now),
            updatedAt: normalizeDateTime(get('updatedAt'), now),
        };
        if (taxRate !== undefined) expense.taxRate = taxRate;
        if (memo !== '') expense.memo = memo;
        expenses.push(expense);
    }

    return { ok: true, expenses, errors };
};

// ファイルの中身を文字列として読む（UTF-8で読めなければ Shift_JIS）
const readFileText = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
        return new TextDecoder('shift_jis').decode(buffer);
    }
};

export function useExpenseCsv() {
    // 支出データをCSVファイルとしてダウンロードさせる
    const downloadCsv = (expenses: Expense[]) => {
        const blob = new Blob(['﻿' + expensesToCsv(expenses)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = buildCsvFileName();
        a.click();
        // ダウンロード開始前に解放されないよう、少し遅らせる
        setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    // 選択されたCSVファイルを解析する
    const readCsvFile = async (file: File): Promise<CsvParseResult> => {
        return parseExpenseCsv(await readFileText(file));
    };

    return {
        downloadCsv,
        readCsvFile,
    };
}
