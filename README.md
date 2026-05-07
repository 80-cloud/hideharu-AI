# タスク管理ボード

個人のタスクを「やること・進行中・完了」の3列で視覚的に管理するKanbanスタイルのWebアプリです。

---

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [ローカル環境構築](#ローカル環境構築)
5. [AWSデプロイ環境](#awsデプロイ環境)
6. [APIエンドポイント](#apiエンドポイント)
7. [主な機能](#主な機能)
8. [ドキュメント一覧](#ドキュメント一覧)

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
| React | 19.2.5 | UIコンポーネントライブラリ |
| Vite | 8.0.10 | フロントエンドビルドツール・開発サーバー |
| Tailwind CSS | 4.2.4 | ユーティリティファーストCSSフレームワーク |
| Axios | 1.15.2 | バックエンドAPIとのHTTP通信 |

### インフラ・環境（ローカル）

| 技術 | 用途 |
|---|---|
| PostgreSQL 16 | 本体データベース（Dockerコンテナで起動） |
| Docker + docker-compose | ローカルDB環境の起動・管理 |

### インフラ・環境（AWS デプロイ／任意）

| 技術 | 用途 |
|---|---|
| AWS EC2 (t3.micro) | アプリサーバー（無料枠） |
| AWS RDS PostgreSQL (db.t3.micro) | マネージドDB（無料枠） |
| AWS VPC + Security Group | カスタムネットワーク・多層防御 |
| Terraform | Infrastructure as Code（AWS リソース宣言管理） |
| AWS CLI v2 | 認証設定・補助操作 |
| tflint / tfsec / shellcheck | Terraform 品質チェック（`~/.claude/skills/terraform-quality-check/` の Claude Code スキルにまとめてある） |

詳細は [`task-board/docs/インフラ構成.md`](task-board/docs/インフラ構成.md) 参照。

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
├── infra/                           # AWS デプロイ環境（Terraform IaC）
│   ├── main.tf                      # VPC / Subnet / SG / EC2 / RDS 定義
│   ├── variables.tf                 # 入力変数（IP・パスワード等）
│   ├── outputs.tf                   # 出力（EIP・RDS endpoint 等）
│   ├── user_data.sh                 # cloud-init（EC2 初回セットアップ）
│   ├── start.sh                     # アプリ起動スクリプト
│   ├── terraform.tfvars.example     # tfvars サンプル
│   └── .gitignore                   # tfstate / tfvars 除外
└── task-board/
    ├── index.html                   # v1.0 フロントエンド（Vanilla JS）
    ├── style.css
    ├── app.js
    ├── prototype.html               # 画面確認用プロトタイプ
    ├── 要件定義書.md                 # プロジェクト要件定義
    ├── docker-compose.yml           # PostgreSQL 起動設定（env-var 駆動）
    ├── .env.example                 # 環境変数テンプレート
    ├── .gitignore                   # .env 除外
    ├── docs/
    │   ├── 画面設計書.md             # UI設計・画面遷移図
    │   ├── DB設計書.md              # ER図・テーブル定義
    │   ├── 技術スタック.md           # 技術選定と採用理由
    │   ├── インフラ構成.md           # AWS デプロイ環境の構成図・設計方針
    │   └── incidents/               # 学習中に発生した不具合記録
    │       ├── INDEX.md
    │       └── cases/
    ├── backend/                     # Spring Boot アプリ
    │   ├── build.gradle
    │   ├── settings.gradle
    │   ├── gradlew
    │   └── src/
    │       └── main/
    │           ├── java/com/taskboard/
    │           │   ├── config/CorsConfig.java（env-var 駆動）
    │           │   ├── domain/task/
    │           │   └── exception/
    │           └── resources/
    │               ├── application.yml（env-var 駆動）
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

- Docker Desktop がインストールされていること
- Java 21 がインストールされていること（`java -version` で確認）
- Node.js 18以上 + npm がインストールされていること

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

## AWSデプロイ環境

ローカル開発に加え、**AWS 無料枠** で本格的なクラウドデプロイ学習を実施しています。
Infrastructure as Code（Terraform）でインフラ全体を宣言的に管理しているため、コマンド数行で再現可能です。

### 構成（高レベル）

```
[ブラウザ] ──→ [EC2 (Vite + Spring Boot)] ──→ [RDS (PostgreSQL)]
                  └─ パブリックサブネットA       └─ DB Subnet Group (1a + 1c)
                  └─ Security Group: 自PC IP のみ
                  └─ Elastic IP / IMDSv2 / EBS暗号化
```

- **EC2 と RDS は同一 VPC 内**、RDS は `publicly_accessible=false` で外部直接アクセス不可
- **RDS への到達は EC2 SG の所属インスタンス経由のみ**（SG 参照ベース、IP 不要）
- 多層防御（ネットワーク層・リソース層・SG層）+ 環境変数による認証情報の外部化

### 構築・撤収

```bash
cd infra
terraform init
terraform plan      # 適用前に差分確認
terraform apply     # AWS 上にリソース作成
# ... 動作確認 ...
terraform destroy   # 学習終了後は撤収（無料枠保護）
```

### 詳細ドキュメント

- [`task-board/docs/インフラ構成.md`](task-board/docs/インフラ構成.md) — 構成図 / 設計方針 / 多層防御 / 無料枠ポリシー
- [`task-board/docs/incidents/INDEX.md`](task-board/docs/incidents/INDEX.md) — 構築・運用中の不具合カタログ
- [`infra/`](infra/) — 実 Terraform コード

### 品質チェック

`infra/` 配下の品質チェックは専用スキルにまとめてあります（`fmt` / `validate` / `tflint` / `tfsec` / `shellcheck` / 機密情報スキャン / 無料枠確認 / ドリフト検出）：

```
~/.claude/skills/terraform-quality-check/SKILL.md
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
| [インフラ構成](task-board/docs/インフラ構成.md) | AWSデプロイ環境の構成図・設計方針・多層防御・無料枠ポリシー |
| [インシデント記録](task-board/docs/incidents/INDEX.md) | 学習中の不具合事例（症状・真因・是正処置） |
| [CLAUDE.md](CLAUDE.md) | Claude Code 向け開発ルール（ブランチ・コミット・PR規則） |
