<template>
  <div class="edit-expense">
    <h2>食費を編集</h2>
    <form @submit.prevent="save" v-if="form">
      <label>日付</label>
      <input type="date" v-model="form.date" required>

      <label>金額</label>
      <div class="amount-group">
        <input type="number" v-model="form.amount" required min="0" class="amount-input" @input="onAmountInput">
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
        <button type="submit" class="primary">更新</button>
      </div>
    </form>
    <div v-else>
      読み込み中...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expenseStore';
import type { Category } from '../types';
import { CATEGORIES } from '../constants';

import { useTaxCalculator } from '../composables/useTaxCalculator';

const route = useRoute();
const router = useRouter();
const store = useExpenseStore();

const { activeTaxRate, applyTax, resetTax, initializeFromExpense } = useTaxCalculator();

const form = ref<{
  date: string;
  amount: number | null;
  category: Category;
  ratio: number;
  memo: string;
} | null>(null);

const onAmountInput = () => {
  resetTax();
};

onMounted(() => {
  const id = route.params.id as string;
  const expense = store.getExpenseById(id);
  if (expense) {
    form.value = {
      date: expense.date,
      amount: expense.amount,
      category: expense.category,
      ratio: expense.ratio,
      memo: expense.memo || ''
    };

    // 税率情報があれば復元してComposableの状態を初期化する
    initializeFromExpense(expense.amount, expense.taxRate);
  } else {
    alert('データが見つかりません');
    router.push('/');
  }
});

const handleApplyTax = (rate: number) => {
  if (form.value) {
    const newAmount = applyTax(rate, form.value.amount);
    if (newAmount !== null) {
      form.value.amount = newAmount;
    }
  }
};

const save = () => {
  if (form.value) {
    const id = route.params.id as string;
    
    if (form.value.amount === null || form.value.amount === undefined) {
      alert('金額を入力してください');
      return;
    }

    store.updateExpense(id, {
      date: form.value.date,
      amount: form.value.amount as number,
      category: form.value.category,
      ratio: form.value.ratio,
      taxRate: activeTaxRate.value,
      memo: form.value.memo
    });
    router.back();
  }
};
</script>


