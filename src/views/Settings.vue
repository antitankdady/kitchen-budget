<template>
  <div class="settings">
    <h2>設定</h2>

    <div class="section">
      <h3>データの入出力（CSV）</h3>
      <p class="note">別の端末へデータを移すときは、CSVを出力して相手の端末で取り込んでください。</p>

      <div class="csv-block">
        <h4>出力</h4>
        <button class="primary" :disabled="store.expenses.length === 0" @click="exportCsv">
          CSVを出力（全{{ store.expenses.length }}件）
        </button>
      </div>

      <div class="csv-block">
        <h4>取り込み</h4>
        <div class="import-modes">
          <label class="import-mode">
            <input type="radio" value="merge" v-model="importMode">
            <span>
              追加・更新（マージ）
              <small>同じデータは更新日時が新しい方を採用。今のデータは消えません。</small>
            </span>
          </label>
          <label class="import-mode">
            <input type="radio" value="replace" v-model="importMode">
            <span>
              置き換え
              <small>今のデータをすべて削除して、ファイルの内容に入れ替えます。</small>
            </span>
          </label>
        </div>
        <input ref="fileInput" type="file" accept=".csv,text/csv" class="file-input" @change="onFileSelected">
        <button class="primary" :disabled="importing" @click="fileInput?.click()">CSVファイルを選択して取り込む</button>

        <div v-if="importResult" class="import-result">
          <p>
            取り込み完了: 追加 {{ importResult.summary.added }}件 / 更新 {{ importResult.summary.updated }}件 /
            変更なし {{ importResult.summary.unchanged }}件 / スキップ {{ importResult.errors.length }}件
          </p>
          <ul v-if="importResult.errors.length > 0" class="import-errors">
            <li v-for="error in importResult.errors.slice(0, MAX_ERROR_LINES)" :key="error.line">
              {{ error.line }}行目: {{ error.message }}
            </li>
            <li v-if="importResult.errors.length > MAX_ERROR_LINES">
              ほか {{ importResult.errors.length - MAX_ERROR_LINES }}件
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>データ管理</h3>
      <button class="danger" @click="clearData">全データを削除</button>
    </div>

    <div class="buttons">
      <button class="secondary" @click="router.push('/')">戻る</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expenseStore';
import { useExpenseCsv, type CsvRowError } from '../composables/useExpenseCsv';
import type { ImportMode, ImportSummary } from '../types';

// 結果に表示するスキップ行の最大数
const MAX_ERROR_LINES = 20;

const router = useRouter();
const store = useExpenseStore();
const { downloadCsv, readCsvFile } = useExpenseCsv();

const fileInput = ref<HTMLInputElement | null>(null);
const importMode = ref<ImportMode>('merge');
const importing = ref(false);
const importResult = ref<{ summary: ImportSummary; errors: CsvRowError[] } | null>(null);

const exportCsv = () => {
  downloadCsv(store.expenses);
};

const onFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  // 同じファイルを再選択できるよう選択状態を戻す
  input.value = '';
  if (!file) return;

  importing.value = true;
  importResult.value = null;
  try {
    const result = await readCsvFile(file);
    if (!result.ok) {
      alert(`取り込めませんでした。\n${result.message}`);
      return;
    }
    if (result.expenses.length === 0) {
      alert(`取り込めるデータがありません（スキップ ${result.errors.length}件）。`);
      importResult.value = { summary: { added: 0, updated: 0, unchanged: 0 }, errors: result.errors };
      return;
    }

    const skipped = result.errors.length > 0 ? `（不正な行 ${result.errors.length}件はスキップ）` : '';
    const message = importMode.value === 'replace'
      ? `今のデータ ${store.expenses.length}件をすべて削除し、${result.expenses.length}件に置き換えます${skipped}。\nこの操作は取り消せません。よろしいですか？`
      : `${result.expenses.length}件のデータを追加・更新します${skipped}。よろしいですか？`;
    if (!confirm(message)) return;

    const summary = store.importExpenses(result.expenses, importMode.value);
    importResult.value = { summary, errors: result.errors };
  } catch (e) {
    console.error('CSVの取り込みに失敗しました', e);
    alert('ファイルの読み込みに失敗しました。');
  } finally {
    importing.value = false;
  }
};

const clearData = () => {
  if (confirm('本当に全てのデータを削除しますか？この操作は取り消せません。')) {
    localStorage.removeItem('food_expense_app_v1');
    location.reload();
  }
};
</script>
