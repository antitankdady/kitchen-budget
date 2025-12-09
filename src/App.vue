<script setup lang="ts">
import { onMounted } from 'vue';
import { useExpenseStore } from './stores/expenseStore';
import SummaryBar from './components/SummaryBar.vue';

const store = useExpenseStore();

onMounted(() => {
  store.loadFromLocalStorage();
});
</script>

<template>
  <div class="app-container">
    <SummaryBar />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>
