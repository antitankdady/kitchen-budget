<template>
  <div class="edit-expense">
    <h2>支出を編集</h2>
    <form @submit.prevent="save" v-if="form">
      <label>日付</label>
      <input type="date" v-model="form.date" required>

      <label>金額</label>
      <div class="amount-group">
        <input type="number" v-model="form.amount" required min="0" class="amount-input" @input="onAmountInput">
        <div class="tax-buttons">
          <button type="button" class="tax-btn" :class="{ active: activeTaxRate === 0.08 }" @click="applyTax(0.08)">+8%</button>
          <button type="button" class="tax-btn" :class="{ active: activeTaxRate === 0.10 }" @click="applyTax(0.10)">+10%</button>
        </div>
      </div>

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

const route = useRoute();
const router = useRouter();
const store = useExpenseStore();

const form = ref<{
  date: string;
  amount: number | null;
  category: Category;
  ratio: number;
  memo: string;
} | null>(null);

const baseAmount = ref<number | null>(null);
const activeTaxRate = ref<number>(0);

const onAmountInput = () => {
  activeTaxRate.value = 0;
  baseAmount.value = null;
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


    // 税率情報があれば復元する
    if (expense.taxRate && expense.taxRate > 0) {
      activeTaxRate.value = expense.taxRate;
      // 表示・トグル用に基本金額（税抜）を逆算する
      // 金額 = floor(基本 * (1+税率)) なので、基本 ≒ 金額 / (1+税率)
      // 切り捨てに対処するため ceil を使用（基本金額は通常整数）
       baseAmount.value = Math.ceil(expense.amount / (1 + expense.taxRate));
    }
  } else {
    alert('データが見つかりません');
    router.push('/');
  }
});

const applyTax = (rate: number) => {
  if (form.value && form.value.amount !== null) {
      // 現在課税されていない場合、基本金額（税抜）を保持する
      if (activeTaxRate.value === 0) {
        baseAmount.value = form.value.amount;
      }

      // 選択中のボタンをクリックした場合、解除する（基本金額に戻す）
      if (activeTaxRate.value === rate) {
        if (baseAmount.value !== null) {
          form.value.amount = baseAmount.value;
        }
        activeTaxRate.value = 0;
        return;
      }

      // 基本金額に新しい税率を適用する
      if (baseAmount.value !== null) {
        form.value.amount = Math.floor(baseAmount.value * (1 + rate));
        activeTaxRate.value = rate;
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


