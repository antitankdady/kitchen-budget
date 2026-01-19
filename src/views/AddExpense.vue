<template>
  <div class="add-expense">
    <h2>食費を登録</h2>
    <form @submit.prevent="save">
      <label>日付</label>
      <input type="date" v-model="form.date" required>

      <label>金額</label>
      <div class="amount-group">
        <input type="number" v-model="form.amount" required min="0" placeholder="例: 1000" class="amount-input" @input="onAmountInput">
        <div class="tax-buttons">
          <button type="button" class="tax-btn" :class="{ active: activeTaxRate === 0.08 }" @click="handleApplyTax(0.08)">+8%</button>
          <button type="button" class="tax-btn" :class="{ active: activeTaxRate === 0.10 }" @click="handleApplyTax(0.10)">+10%</button>
        </div>
      </div>

      <label>カテゴリ</label>
      <select v-model="form.category" required>
        <option v-for="(label, key) in CATEGORIES" :key="key" :value="key">{{ label }}</option>
      </select>

      <label>自分の負担割合 (0〜100%)</label>
      <div class="ratio-input">
        <div class="ratio-field-wrapper">
          <input type="number" v-model="form.ratio" step="1" min="0" max="100" required class="ratio-field">
          <span class="unit">%</span>
        </div>
        <span class="ratio-preview">実費: ¥{{ Math.ceil((form.amount || 0) * (form.ratio / 100)).toLocaleString() }}</span>
      </div>

      <label>メモ</label>
      <textarea v-model="form.memo" placeholder="備考"></textarea>

      <div class="buttons">
        <button type="button" class="secondary" @click="router.back()">キャンセル</button>
        <button type="submit" class="primary">保存</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expenseStore';
import type { Category } from '../types';
import { CATEGORIES } from '../constants';

import { useTaxCalculator } from '../composables/useTaxCalculator';

const router = useRouter();
const store = useExpenseStore();

const { activeTaxRate, applyTax, resetTax } = useTaxCalculator();

const form = reactive<{
  date: string;
  amount: number | null;
  category: Category;
  ratio: number;
  memo: string;
}>({
  date: new Date().toISOString().split('T')[0] as string,
  amount: null,
  category: 'general',
  ratio: 100,
  memo: ''
});

const onAmountInput = () => {
  resetTax();
};

const handleApplyTax = (rate: number) => {
  const newAmount = applyTax(rate, form.amount);
  if (newAmount !== null) {
    form.amount = newAmount;
  }
};

const save = () => {
  if (form.amount === null || form.amount === undefined) {
    alert('金額を入力してください');
    return;
  }

  store.addExpense({
    date: form.date,
    amount: form.amount as number, // 上記で検証済み
    category: form.category,
    ratio: form.ratio,
    taxRate: activeTaxRate.value,
    memo: form.memo
  });
  router.back();
};
</script>


