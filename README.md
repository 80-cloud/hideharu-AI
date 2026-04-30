# タスク管理ボード

個人のタスクを「やること・進行中・完了」の3列で視覚的に管理するKanbanスタイルのWebアプリです。

---

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [ローカル環境構築](#ローカル環境構築)
5. [APIエンドポイント](#apiエンドポイント)
6. [主な機能](#主な機能)
7. [ドキュメント一覧](#ドキュメント一覧)

---

## プロジェクト概要

| 項目 | 内容 |
|---|---|
| プロジェクト名 | タスク管理ボード |
| バージョン | v2.0（フルスタック構成） |
| リポジトリ | https://github.com/80-cloud/hideharu-AI |
| 開発者 | hideharu-AI |

### 背景・目的

付箋やメモでタスクを管理すると「どれが未対応か」「進捗がどこまでか」が一目でわからなくなる問題を解決します。  
ボード形式で「今すべきこと・やっていること・終わったこと」を画面を開けば即座に把握できるWebアプリを開発しています。

### バージョン履歴

| バージョン | 構成 | 説明 |
|---|---|---|
| v1.0 | Vanilla JS + localStorage | ブラウザ完結型。サーバー不要 |
| v2.0 | Java + Spring Boot + React + PostgreSQL | フルスタック構成。データをDBに永続保存 |

---

## 技術スタック

### バックエンド

| 技術 | バージョン | 役割 |
|---|---|---|
| Java | 21（LTS） | サーバーサイドの実装言語 |
| Spring Boot | 3.5.0 | Webフレームワーク |
| Gradle | 8.14.4 | ビルドツール |
| Spring Data JPA + Hibernate | Spring Boot内蔵 | DBアクセス（ORM） |
| Flyway | Spring Boot内蔵 | DBマイグレーション管理 |
| PostgreSQL ドライバー | Spring Boot内蔵 | JavaとDBの接続 |
| Lombok | Spring Boot内蔵 | 定型コードの自動生成 |

### フロントエンド

| 技術 | バージョン | 役割 |
|---|---|---|
| Node.js | 25.9.0 | JavaScriptランタイム |
| npm | 11.12.1 | パッケージ管理 |
| React | 19.2.5 | UIコンポーネントライブラリ |
| Vite | 8.0.10 | フロントエンドビルドツール・開発サーバー |
| Tailwind CSS | 4.2.4 | ユーティリティファーストCSSフレームワーク |
| Axios | 1.15.2 | バックエンドAPIとのHTTP通信 |

### インフラ・環境

| 技術 | 用途 |
|---|---|
| PostgreSQL 16 | 本体データベース（Dockerコンテナで起動） |
| Docker + docker-compose | ローカルDB環境の起動・管理 |

---

## ディレクトリ構成

```
/
├── CLAUDE.md                        # Claude Code 行動規範（開発ルール）
├── README.md                        # 本ファイル
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md            # バグ報告テンプレート
│   │   └── feature_request.md       # 機能要望テンプレート
│   └── pull_request_template.md     # PRテンプレート
└── task-board/
    ├── index.html                   # v1.0 フロントエンド（Vanilla JS）
    ├── style.css
    ├── app.js
    ├── prototype.html               # 画面確認用プロトタイプ
    ├── 要件定義書.md                 # プロジェクト要件定義
    ├── docker-compose.yml           # PostgreSQL 起動設定
    ├── docs/
    │   ├── 画面設計書.md             # UI設計・画面遷移図
    │   ├── DB設計書.md              # ER図・テーブル定義
    │   └── 技術スタック.md           # 技術選定と採用理由
    ├── backend/                     # Spring Boot アプリ
    │   ├── build.gradle
    │   ├── settings.gradle
    │   ├── gradlew
    │   └── src/
    │       └── main/
    │           ├── java/com/taskboard/
    │           └── resources/
    │               ├── application.properties
    │               └── db/migration/  # Flyway SQLファイル
    └── frontend/                    # React アプリ
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── main.jsx
            ├── App.jsx
            └── components/
```

---

## ローカル環境構築

### 前提条件

- Docker Desktop がインストールされていること（動作確認: v29.4.1）
- Java 21 がインストールされていること（`java -version` で確認、動作確認: OpenJDK 21.0.11）
- Node.js v25.9.0 + npm 11.12.1 がインストールされていること

### 1. リポジトリをクローン

```bash
git clone https://github.com/80-cloud/hideharu-AI.git
cd hideharu-AI
```

### 2. PostgreSQL を起動（Docker）

```bash
cd task-board
docker-compose up -d
```

起動確認：

```bash
docker-compose ps
# Status が "Up" になっていればOK
```

### 3. バックエンドを起動（Spring Boot）

```bash
cd task-board/backend
./gradlew bootRun
```

起動確認：`http://localhost:8080/actuator/health` にアクセスして `{"status":"UP"}` が返れば正常。

### 4. フロントエンドを起動（React + Vite）

```bash
cd task-board/frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開くとボード画面が表示されます。

### 5. 停止

```bash
# フロントエンド・バックエンド: Ctrl+C

# PostgreSQL コンテナ停止
cd task-board
docker-compose down
```

---

## APIエンドポイント

バックエンドは `http://localhost:8080` で動作します。

| メソッド | URL | 操作 |
|---|---|---|
| `GET` | `/api/tasks` | タスク一覧を取得 |
| `POST` | `/api/tasks` | タスクを新規作成 |
| `PUT` | `/api/tasks/{id}` | タスクを更新（編集・カラム移動） |
| `DELETE` | `/api/tasks/{id}` | タスクを削除 |

---

## 主な機能

| 機能 | 説明 |
|---|---|
| Kanbanボード表示 | 「やること」「進行中」「完了」の3カラム構成 |
| タスク追加 | 各カラムの「＋」ボタンからフォームで追加 |
| タスク編集 | カードクリックまたは編集ボタンからモーダルで編集 |
| タスク削除 | 削除確認ダイアログ付きで削除（元に戻せない） |
| 優先度表示 | 高／中／低をカラーバッジで表示 |
| 期限管理 | 期限日表示＋期限切れタスクに警告マーク（⚠）を表示 |
| ドラッグ＆ドロップ | カラム間移動・カラム内並び替えに対応（Trello方式） |
| 並び替えボタン | 優先度順・期限順で一括並び替え |
| データ永続化 | PostgreSQLにデータを保存（ブラウザを閉じても消えない） |

---

## ドキュメント一覧

| ドキュメント | 内容 |
|---|---|
| [要件定義書](task-board/要件定義書.md) | プロジェクトの目的・機能要件・非機能要件・スケジュール |
| [画面設計書](task-board/docs/画面設計書.md) | ユースケース・画面レイアウト・操作フロー・画面遷移図 |
| [DB設計書](task-board/docs/DB設計書.md) | ER図・テーブル定義・インデックス設計 |
| [技術スタック](task-board/docs/技術スタック.md) | 使用技術・バージョン・採用理由・不採用技術の比較 |
| [CLAUDE.md](CLAUDE.md) | Claude Code 向け開発ルール（ブランチ・コミット・PR規則） |
