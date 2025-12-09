<template>
  <div class="summary-bar">
    <div class="summary-content">
      <div class="summary-item">
        <span class="label">合計</span>
        <span class="value">¥{{ totalAmount.toLocaleString() }}</span>
      </div>
      <div class="summary-item">
        <span class="label">自分の実費</span>
        <span class="value highlight">¥{{ myAmount.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useExpenseStore } from '../stores/expenseStore';

const store = useExpenseStore();
const totalAmount = computed(() => store.totalAmount);
const myAmount = computed(() => store.myAmount);
</script>


