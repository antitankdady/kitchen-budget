<template>
  <div class="home">
    <div class="filters">
      <div class="date-range">
        <input type="date" v-model="startDate">
        <span>~</span>
        <input type="date" v-model="endDate">
      </div>
      <select v-model="selectedCategory" class="category-select">
        <option value="all">全カテゴリ</option>
        <option value="meat">肉</option>
        <option value="fish">魚</option>
        <option value="vegetable">野菜</option>
        <option value="eatingout">外食</option>
        <option value="general">全般</option>
      </select>
      <button class="add-btn" @click="goToAdd">+</button>
    </div>

    <div class="expense-list">
      <ExpenseItem
        v-for="expense in filteredExpenses"
        :key="expense.id"
        :expense="expense"
        @edit="editExpense"
        @delete="deleteExpense"
      />
      <div v-if="filteredExpenses.length === 0" class="no-data">
        データがありません
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expenseStore';
import ExpenseItem from '../components/ExpenseItem.vue';

const router = useRouter();
const store = useExpenseStore();

// デフォルトで現在の月を選択
const today = new Date();
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

// ローカル時間で YYYY-MM-DD 形式にフォーマットするヘルパー
const formatDate = (date: Date) => date.toLocaleDateString('sv-SE');

// Initialize store filter if empty
if (!store.filterState.startDate) {
  store.setFilter(
    formatDate(firstDay),
    formatDate(lastDay),
    'all'
  );
}

const filteredExpenses = computed(() => store.filteredExpenses);

const startDate = computed({
  get: () => store.filterState.startDate,
  set: (val) => store.setFilter(val, store.filterState.endDate, store.filterState.category)
});

const endDate = computed({
  get: () => store.filterState.endDate,
  set: (val) => store.setFilter(store.filterState.startDate, val, store.filterState.category)
});

const selectedCategory = computed({
  get: () => store.filterState.category,
  set: (val) => store.setFilter(store.filterState.startDate, store.filterState.endDate, val)
});

const goToAdd = () => {
  router.push('/add');
};

const editExpense = (id: string) => {
  router.push(`/edit/${id}`);
};

const deleteExpense = (id: string) => {
  if (confirm('削除しますか？')) {
    store.deleteExpense(id);
  }
};
</script>


