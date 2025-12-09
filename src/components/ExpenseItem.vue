<template>
  <div class="expense-item">
    <div class="info">
      <div class="date-category">
        <span class="date">{{ formatDate(expense.date) }}</span>
        <span class="category-badge" :class="expense.category">{{ getCategoryLabel(expense.category) }}</span>
      </div>
      <div class="memo" v-if="expense.memo">{{ expense.memo }}</div>
    </div>
    <div class="amounts">
      <div class="amount">¥{{ expense.amount.toLocaleString() }}</div>
      <div class="ratio-info">負担: {{ expense.ratio }}%</div>
      <div class="my-amount">(実費: ¥{{ Math.ceil(expense.amount * (expense.ratio / 100)).toLocaleString() }})</div>
    </div>
    <div class="actions">
      <button @click="$emit('edit', expense.id)" class="edit-btn">編集</button>
      <button @click="$emit('delete', expense.id)" class="delete-btn">削除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Expense, Category } from '../types';

defineProps<{
  expense: Expense;
}>();

defineEmits<{
  (e: 'edit', id: string): void;
  (e: 'delete', id: string): void;
}>();

const formatDate = (dateStr: string) => {
return new Date(dateStr).toLocaleDateString("ja-JP", {year: "numeric",month: "2-digit",day: "2-digit"})
};

const getCategoryLabel = (category: Category) => {
  const labels: Record<Category, string> = {
    meat: '肉',
    fish: '魚',
    vegetable: '野菜',
    eatingout: '外食',
    general: '全般',
  };
  return labels[category];
};
</script>


