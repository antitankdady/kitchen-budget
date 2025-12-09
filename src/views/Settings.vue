<template>
  <div class="settings">
    <h2>設定</h2>
    
    <div class="section">
      <h3>Google Drive 連携 (Stub)</h3>
      <p class="status">ステータス: 未連携</p>
      <button class="primary" @click="connectDrive">Google Drive に接続</button>
      <p class="note">※現在はスタブ実装のため、実際の連携は行われません。</p>
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
import { useRouter } from 'vue-router';
import { initGoogleDrive, signInToGoogle } from '../api/drive';

const router = useRouter();

const connectDrive = async () => {
  await initGoogleDrive();
  await signInToGoogle();
  alert('Google Drive 連携 (Stub) が完了しました');
};

const clearData = () => {
  if (confirm('本当に全てのデータを削除しますか？この操作は取り消せません。')) {
    localStorage.removeItem('food_expense_app_v1');
    location.reload();
  }
};
</script>


