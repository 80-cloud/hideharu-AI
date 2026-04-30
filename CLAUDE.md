# CLAUDE.md — Claude Code 行動規範

> このファイルは Claude Code が毎セッション必ず読み込み、厳守するルール集です。
> 記載のルールに反する操作（直接 main への push など）は、ユーザーに確認なく実行しないこと。

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| プロジェクト名 | タスク管理ボード (hideharu-AI) |
| リポジトリ | https://github.com/80-cloud/hideharu-AI |
| バックエンド | Java 21 + Spring Boot 3.5.0 + Gradle |
| フロントエンド | HTML / CSS / JavaScript (v1.0) → React + Tailwind CSS (v2.0) |
| データベース | PostgreSQL 16（Docker コンテナ） |
| 作業ディレクトリ | /Users/macmini/Desktop/Cursor |

---

## 1. ブランチ命名規則

作業を始める前に必ず Issue を作成し、その番号をブランチ名に含めること。

| 種別 | 命名パターン | 例 |
|---|---|---|
| 新機能 | `feature/#(番号)-(短い説明)` | `feature/#12-login-page` |
| バグ修正 | `fix/#(番号)-(説明)` | `fix/#15-card-drag-bug` |
| ドキュメント | `docs/#(番号)-(説明)` | `docs/#8-readme-update` |
| 雑務・設定 | `chore/#(番号)-(説明)` | `chore/#3-setup-eslint` |

**禁止事項:**
- `main` ブランチへの直接 push は絶対禁止
- Issue 番号のないブランチ名は作成しない
- `master` ブランチは使用しない

---

## 2. Issue ファースト・ワークフロー

**作業を始める前に必ず GitHub Issue を作成すること（または既存 Issue を確認すること）。** コードを書く前の手順：

```
① GitHub で Issue を作成する（テンプレートを使用）
         ↓
② Issue 番号を確認する（例: #12）
         ↓
③ ブランチを作成する: git checkout -b feature/#12-説明
         ↓
④ 作業・コミットを行う
         ↓
⑤ PR を作成し、Issue を Closes #12 でリンクする
         ↓
⑥ main へマージ後、ブランチを削除する
```

---

## 3. コミットメッセージ規則

**すべてのコミットメッセージは Conventional Commits 形式で、日本語で書くこと。**

### フォーマット

```
種別: 変更の要約（日本語・50文字以内）

詳細説明（任意・72文字で折り返す）
関連する背景・理由・注意点などを書く。

Closes #(Issue番号)  ← 該当する場合のみ
```

### 種別一覧

| 種別 | 用途 |
|---|---|
| `feat` | 新機能の追加 |
| `fix` | バグの修正 |
| `docs` | ドキュメントのみの変更 |
| `style` | コードの動作に影響しない変更（フォーマット等） |
| `refactor` | バグ修正でも機能追加でもないコード変更 |
| `test` | テストの追加・修正 |
| `chore` | ビルドツールや補助ツールの変更 |

### コミットメッセージ例

```
feat: タスクカードのドラッグ&ドロップ機能を追加

Sortable.js を使ってカラム間・カラム内の並び替えを実装。
期限順・優先度順の一括並び替えボタンも追加した。

Closes #12
```

```
fix: 期限切れタスクに警告マークが表示されないバグを修正
```

```
docs: DB設計書にインデックス設計を追記
```

---

## 4. プルリクエスト (PR) 規則

- **タイトルは日本語で書くこと**
- **必ず `.github/pull_request_template.md` のテンプレートを使用すること**
- **必ず関連 Issue を `Closes #番号` で本文にリンクすること**
- **main ブランチへのマージ方法: Squash and merge（スカッシュマージ）を使うこと**
- PR のタイトルはコミットメッセージと同じ形式にすること: `種別: 説明`

### PR タイトル例

```
feat: タスクの追加・編集・削除機能を実装
fix: Dockerコンテナ起動時のポート競合を修正
docs: README にローカル環境構築手順を追加
```

---

## 5. ラベル運用ルール

Issue・PR には必ずラベルを付けること。

| ラベル | 色 | 用途 |
|---|---|---|
| `enhancement` | 水色 | 新機能・改善 |
| `bug` | 赤 | バグ報告・修正 |
| `documentation` | 青 | ドキュメントのみの変更 |
| `chore` | グレー | 設定・ツール・依存関係の変更 |

---

## 6. 禁止事項（Claude Code が守るべきルール）

1. `git push origin main` を直接実行しない
2. `git push --force` を main に対して実行しない
3. Issue なしにブランチを作成しない
4. 英語でコミットメッセージを書かない（日本語必須）
5. PR なしに main へのコードを反映しない
6. `.env` ファイルを Git にコミットしない
7. データベースのパスワードをコードに直書きしない

---

## 7. 技術スタック補足（Claude Code 向け）

### サービス起動（起動順を守ること）

```bash
# ① PostgreSQL を Docker で起動
cd /Users/macmini/Desktop/Cursor/task-board
docker-compose up -d

# ② Spring Boot を起動（Gradle）
cd /Users/macmini/Desktop/Cursor/task-board/backend
./gradlew bootRun

# ③ React フロントエンドを起動（Vite）
cd /Users/macmini/Desktop/Cursor/task-board/frontend
npm run dev
```

> ポート競合が発生した場合はセクション10のルールに従うこと。

### ビルドツール

- バックエンド: **Gradle**（`build.gradle` を使用）
  - ビルドファイル: `task-board/backend/build.gradle`
- フロントエンド: **Node.js v25 / npm / Vite**（`package.json` を使用）
  - ビルドファイル: `task-board/frontend/package.json`

### ファイル構成

```
/Users/macmini/Desktop/Cursor/
├── CLAUDE.md                    ← 本ファイル（必読）
├── README.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
└── task-board/
    ├── index.html               ← フロントエンド v1.0（旧）
    ├── style.css                ← フロントエンド v1.0（旧）
    ├── app.js                   ← フロントエンド v1.0（旧）
    ├── prototype.html           ← プロトタイプ（旧）
    ├── 要件定義書.md
    ├── docker-compose.yml       ← PostgreSQL 起動
    ├── docs/
    │   ├── 画面設計書.md
    │   ├── DB設計書.md
    │   └── 技術スタック.md
    ├── frontend/                ← React フロントエンド v2.0（現行）
    │   ├── index.html
    │   ├── vite.config.js
    │   ├── package.json
    │   └── src/
    │       ├── main.jsx
    │       ├── App.jsx
    │       ├── api/taskApi.js
    │       ├── components/
    │       │   ├── Header.jsx
    │       │   ├── Board.jsx
    │       │   ├── Column.jsx
    │       │   └── TaskCard.jsx
    │       ├── context/TaskContext.jsx
    │       └── utils/dateUtils.js
    └── backend/                 ← Spring Boot (Java 21)
        ├── build.gradle
        └── src/main/java/com/taskboard/
            ├── config/CorsConfig.java
            ├── domain/task/
            │   ├── Task.java
            │   ├── TaskController.java
            │   ├── TaskRepository.java
            │   └── TaskService.java
            └── exception/
                ├── GlobalExceptionHandler.java
                └── TaskNotFoundException.java
```

---

## 8. GitHub ブランチ保護設定（セットアップ用コマンド）

リポジトリを新規セットアップする際や保護設定をリセットする際に使用する `gh api` コマンド。

```bash
gh api repos/80-cloud/hideharu-AI/branches/main/protection \
  --method PUT \
  --header "Accept: application/vnd.github+json" \
  --input - <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

> `required_pull_request_reviews` を設定することで、PR なしに main へマージできなくなる。
> `required_approving_review_count: 0` はソロ開発向け（承認者不要、ただし PR 自体は必須）。

**Note:** 個人リポジトリでは PR レビューの必須化ができない場合がある（GitHub Free 制限）。  
その場合は `"required_pull_request_reviews": null` に変更し、CLAUDE.md のルールで運用カバーする。

---

## 9. 検証方法

セットアップ後に以下のコマンドで正しく設定されているか確認すること。

```bash
# 1. CLAUDE.md の内容確認
cat CLAUDE.md

# 2. ブランチ保護が有効か確認
gh api repos/80-cloud/hideharu-AI/branches/main/protection | python3 -m json.tool

# 3. ラベル一覧確認
gh label list --repo 80-cloud/hideharu-AI
```

3 については、以降の作業で Claude Code がルールに従って動作するか実際に確認する。  
（Issue 作成 → ブランチ作成 → 実装 → コミット → PR 作成 → マージ の順に実施）

---

## 10. ポート競合の扱い（Claude Code 必須ルール）

### 使用ポート一覧

| サービス | コマンド | ポート |
|---|---|---|
| Spring Boot（バックエンド） | `./gradlew bootRun` | **8080** |
| Vite（フロントエンド） | `npm run dev` | **5173** |
| PostgreSQL（DB） | `docker-compose up` | **5432** |

### ルール

1. **サーバー起動前に必ずポートの空きを確認すること**
2. **ポートが使用中の場合は、そのプロセスを `kill -9` で強制終了してから起動すること**
3. **別ポートでの代替起動は絶対禁止** — CORS 設定・Vite プロキシが崩れてアプリが動作しない

### 理由

- CORS 設定（`CorsConfig.java`）は `http://localhost:5173` のみ許可
- Vite プロキシ（`vite.config.js`）は `http://localhost:8080` に転送
- 上記以外のポートで起動すると API 通信が 100% 失敗する

### 強制終了コマンド（手動で実行する場合）

```bash
# ポート 8080 を解放（バックエンド）
lsof -ti :8080 | xargs kill -9 2>/dev/null; true

# ポート 5173 を解放（フロントエンド）
lsof -ti :5173 | xargs kill -9 2>/dev/null; true

# ポート 5432 を解放（DB）
lsof -ti :5432 | xargs kill -9 2>/dev/null; true
```

> **Claude Code 自動化:** `~/.claude/settings.json` の PreToolUse フックにより、
> `bootRun` / `npm run dev` / `docker-compose up` を実行する直前に自動でポート競合を検知・解消する。

---

## 11. このファイルの更新ルール

- ルールを変更したい場合は、必ず Issue を立ててから PR 経由で変更すること
- 直接編集してコミットしない
- 変更時のコミットメッセージ: `chore: CLAUDE.md のルールを更新 (#番号)`
