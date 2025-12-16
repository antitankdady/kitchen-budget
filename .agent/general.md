# プロジェクト仕様書 (Kitchen Budget)

## 1. アプリケーション概要
名称: Kitchen Budget
目的: シンプルな食費管理と割り勘計算機能の提供。
特徴:
- ユーザー登録不要（ローカルストレージ保存）。
- 消費税計算（8%, 10%）のワンタップ入力。
- 負担割合（%）の設定による実費計算。
- ダークモード対応。

## 2. 機能要件

### 2.1 支出管理
- 一覧表示: 日付順（降順）に支出を表示。
- 新規登録: 日付、金額（税抜）、カテゴリ、負担割合、メモを入力。
- 編集: 登録済みデータの修正。税税率情報（taxRate）も保持し、再編集時に二重課税を防ぐ。
- 削除: データの削除。

### 2.2 計算ロジック
- 消費税:
    - ボタン（+8%, +10%）により税抜金額から税込金額（切り捨て）を算出。
    - 排他制御：同時に適用できる税率は1つ。
    - トグル：適用中の税率ボタン再押下で税抜金額に戻る。
- 割り勘（実費）:
    - `金額 * (負担割合 / 100)` で算出（切り上げ表示）。

### 2.3 フィルタリング
- 期間: 開始日・終了日で絞り込み（デフォルト：当月1日〜末日）。
- カテゴリ: 全て、肉、魚、野菜、外食、全般。
- 合計表示: フィルタリングされた結果に基づいて「合計」と「自分の実費」を再計算して表示する。

## 3. データモデル (Expense)
| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | Yes | UUID |
| `date` | string | Yes | YYYY-MM-DD |
| `amount` | number | Yes | 金額（税込） |
| `category` | Category | Yes | `meat`, `fish`, `vegetable`, `eatingout`, `general` |
| `ratio` | number | Yes | 負担割合 (0-100) |
| `taxRate` | number | No | 適用された税率 (0.08 or 0.10) |
| `memo` | string | No | メモ |
| `createdAt` | string | Yes | ISO String |
| `updatedAt` | string | Yes | ISO String |

## 4. 技術スタック
- Frontend: Vue 3 (Script Setup), TypeScript
- State Management: Pinia (Persistence: LocalStorage)
- Tooling: Vite
- Infrastructure: GitHub Pages (GitHub Actions で自動デプロイ)

## 5. UI/UX
- テーマ: ダークモード自動対応（CSS変数使用）。
- レスポンシブ: モバイルフレンドリーなレイアウト。
