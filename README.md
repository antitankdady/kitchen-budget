# Kitchen Budget 🍳

割り勘計算もできる、シンプルな食費管理用Webアプリです。
ブラウザだけで動作し、データは端末内（ローカルストレージ）に保存されるため、会員登録なしですぐに使えます。
その内google driveに保存する機能をつけるかも。

## 🛠️ 開発環境のセットアップ

推奨環境: Node.js v24 以降の LTS 版（Vite 7 の要件により最低でも v20.19 / v22.12 以降が必要）

Windows の場合は winget でインストールできます。

```powershell
winget install --id OpenJS.NodeJS.LTS -e
```

PowerShell で `npm` 実行時に「スクリプトの実行が無効になっている」エラーが出る場合は、次のコマンドを一度だけ実行してください。

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

```bash
# 1. リポジトリのクローン
git clone https://github.com/antitankdady/kitchen-budget.git

# 2. ディレクトリ移動
cd kitchen-budget

# 3. 依存関係のインストール
npm install

# 4. 開発サーバーの起動
npm run dev
# → http://localhost:5173/kitchen-budget/ で確認
```

## 📦 ビルド（公開用）

```bash
npm run build
```

## 📝 技術スタック

*   Vue 3 (Script Setup)
*   TypeScript
*   Vite
*   Pinia (State Management)
