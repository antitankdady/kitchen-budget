<template>
  <div class="add-expense">
    <h2>支出を登録</h2>
    <form @submit.prevent="save">
      <label>日付</label>
      <input type="date" v-model="form.date" required>

      <label>金額</label>
      <input type="number" v-model="form.amount" required min="0" placeholder="例: 1000" class="amount-input">

      <label>カテゴリ</label>
      <select v-model="form.category" required>
        <option value="general">全般</option>
        <option value="meat">肉</option>
        <option value="fish">魚</option>
        <option value="vegetable">野菜</option>
        <option value="eatingout">外食</option>
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

const router = useRouter();
const store = useExpenseStore();

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

const save = () => {
  if (form.amount === null || form.amount === undefined) {
    alert('金額を入力してください');
    return;
  }

  store.addExpense({
    date: form.date,
    amount: form.amount as number, // Validated above
    category: form.category,
    ratio: form.ratio,
    memo: form.memo
  });
  router.back();
};
</script>


