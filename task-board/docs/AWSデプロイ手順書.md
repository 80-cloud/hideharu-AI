# AWSデプロイ手順書（Terraform + AWS CLI ベース・無料枠）

> 本書は、タスク管理ボード (hideharu-AI) を AWS にデプロイするための手順書。
> 対象読者：AWS / Terraform / IaC が初めての学習者。
> 方針：マネジメントコンソールでの手作業を最小化し、コマンドライン + Terraform で再現可能なデプロイを行う。インスタンスは無料枠の範囲内に収める。

---

## 1. 全体像と用語解説

まず登場する技術が何者なのかを押さえる。

### 1-1. AWS（Amazon Web Services）
Amazon が提供するクラウドサービス。サーバー（EC2）、データベース（RDS）、ストレージ（S3）など、200以上のサービスを「使った分だけ課金」で借りられる。

### 1-2. AWS CLI（※ "AWS CUI" は正式には AWS CLI）
**Command Line Interface** の略。AWS をマネジメントコンソール（Web 画面）ではなく、ターミナルから `aws s3 ls` のようなコマンドで操作するツール。

### 1-3. IaC（Infrastructure as Code）
「インフラ構成をコードで書く」という考え方。
- 従来：Web 画面でポチポチ作る → 手順を忘れる、再現できない
- IaC：構成をテキストファイルに書く → Git で履歴管理、何度でも同じ環境を作れる

### 1-4. Terraform
HashiCorp 社の IaC ツール。`.tf` ファイルに AWS 構成を宣言的に書くと、Terraform が「現状」と「あるべき姿」の差分を自動で埋めてくれる。

```
コード(.tf) ──[terraform plan]──> 差分プレビュー
            ──[terraform apply]──> AWS上に実際に作成
            ──[terraform destroy]──> 全部削除（コスト管理に超重要）
```

### 1-5. AWS CLI と Terraform の役割分担
- **AWS CLI**：認証設定・単発操作・確認（`aws sts get-caller-identity` など）
- **Terraform**：インフラの作成・変更・削除（メイン）

---

## 2. 推奨アーキテクチャ（無料枠フィット版）

現状のスタック（Spring Boot + React + PostgreSQL）を AWS に載せる構成案。

### 【推奨】フェーズ1：シンプル単一EC2構成（初学者向け）

```
[ユーザー]
   │
   ▼
┌─────────────────────────────────────┐
│  EC2 t3.micro (Amazon Linux 2023)   │  ← 無料枠：750時間/月×12ヶ月
│  ├─ Docker Compose                  │
│  │   ├─ PostgreSQL 16 (コンテナ)    │
│  │   ├─ Spring Boot (コンテナ)      │
│  │   └─ Nginx (Reactビルド配信)     │
│  └─ Elastic IP (静的IP)             │
└─────────────────────────────────────┘
```

- メリット：無料枠1台で完結、構成が単純
- デメリット：本番運用には不向き（DB とアプリが同居）

### 【発展】フェーズ2：分離構成（学習が進んだら）

```
S3 + CloudFront  ──> Reactフロント配信（無料枠：5GB + 1TB転送）
       │
       ▼
EC2 t3.micro     ──> Spring Boot
       │
       ▼
RDS db.t3.micro  ──> PostgreSQL（無料枠：750時間/月、20GBストレージ）
```

> **最初はフェーズ1を強く推奨する。** RDS や S3 を増やすほど「無料枠超過の事故リスク」も増えるため。

### 無料枠の主要ルール（要：公式の最新情報を都度確認）

| サービス | 無料枠 | 期間 |
|---|---|---|
| EC2 t3.micro | 750時間/月 | 新規作成から12ヶ月（※2024年以降、t2.micro は ap-northeast-1 で対象外） |
| RDS db.t3.micro | 750時間/月、ストレージ20GB | 12ヶ月 |
| S3 | 5GB、GET 2万回、PUT 2千回 | 12ヶ月 |
| データ転送（外向き） | 100GB/月 | 常時無料 |
| Elastic IP | EC2 に紐付き使用中なら無料 | 常時 |

⚠️ **注意：** 1台しか起動しなければ 750時間 ≒ 24時間×31日 = 744時間 で収まる。**2台目を起動すると即超過する。**

---

## 3. 事前準備の手順

### Step 1：AWSアカウント作成
1. https://aws.amazon.com/jp/ で「無料アカウント作成」
2. クレジットカード登録が必須（無料枠超過時の請求用）
3. 携帯電話で本人確認
4. **サポートプランは「ベーシック（無料）」を選ぶ**

### Step 2：ルートユーザーの保護（最重要）
作成直後のアカウントは「ルートユーザー」状態。これは全権限を持つので、**普段使いは絶対にしない**。

```
① ルートユーザーでログイン
② IAM → 「MFA を有効化」（Google Authenticator 等のスマホアプリ推奨）
③ 「アクセスキー」は絶対に作らない（作成済みなら即削除）
```

### Step 3：作業用 IAMユーザーを作成

```
IAM → ユーザー → ユーザーを作成
  名前: terraform-admin
  AWS Management Consoleアクセス: 任意（CLI主体なら不要）
  アクセス許可: 「ポリシーを直接アタッチ」→ AdministratorAccess
        ※ 学習用なので Admin で OK。本番では最小権限に絞る
```

作成後、**「アクセスキー」を発行** する：

```
作成したユーザー → セキュリティ認証情報 → アクセスキーを作成
  ユースケース: 「コマンドラインインターフェイス (CLI)」
  → アクセスキーID と シークレットアクセスキー が表示される
  → CSV をダウンロード（シークレットキーはこの一度しか見られない）
```

### Step 4：AWS CLI のインストール

macOS の場合：

```bash
# Homebrewで
brew install awscli

# バージョン確認
aws --version
# aws-cli/2.x.x のように表示されればOK
```

### Step 5：認証情報の設定

```bash
aws configure
# AWS Access Key ID:     [Step3でダウンロードしたキー]
# AWS Secret Access Key: [Step3でダウンロードしたシークレット]
# Default region name:   ap-northeast-1   ← 東京リージョン
# Default output format: json
```

設定は `~/.aws/credentials` と `~/.aws/config` に保存される。

### Step 6：認証確認

```bash
aws sts get-caller-identity
# ↓ こんな出力が出れば成功
# {
#   "UserId": "AIDAXXXXXXXX",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/terraform-admin"
# }
```

### Step 7：Terraform インストール

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

terraform -version
# Terraform v1.x.x と出ればOK
```

### Step 8：請求アラート設定（事故防止に必須）

```
AWS マネジメントコンソール → Billing → Budgets → Create budget
  Budget type: Cost budget
  予算額: 1 USD（無料枠超過を即検知）
  アラート: 50%, 80%, 100% でメール通知
```

---

## 4. Terraform プロジェクト構成案

`task-board/` の隣に `infra/` ディレクトリを作る想定：

```
/Users/macmini/Desktop/Cursor/
├── task-board/         ← 既存のアプリ
└── infra/              ← 新規作成（Terraformコード）
    ├── main.tf         ← メインリソース定義
    ├── variables.tf    ← 変数定義
    ├── outputs.tf      ← 出力値（IPアドレス等）
    ├── terraform.tfvars ← 値の実体（.gitignore対象）
    └── .gitignore
```

### Terraform 基本構文の解説

```hcl
# プロバイダ宣言：AWSを使うよ
provider "aws" {
  region = "ap-northeast-1"
}

# リソース宣言：「resource」「タイプ」「名前」の3要素
resource "aws_instance" "app_server" {
  ami           = "ami-xxxx"      # OSイメージID
  instance_type = "t3.micro"      # ← 無料枠

  tags = {
    Name = "task-board-server"
  }
}

# 出力：apply後にIPアドレスを表示する
output "public_ip" {
  value = aws_instance.app_server.public_ip
}
```

### 最小構成 main.tf で作るリソース（フェーズ1）

1. **VPC** … ネットワークの箱
2. **Subnet（パブリック）** … EC2 を置く場所
3. **Internet Gateway** … インターネットへの出口
4. **Route Table** … 経路設定
5. **Security Group** … ファイアウォール（22/80/443 番ポート開放）
6. **EC2 Instance（t3.micro）** … サーバー本体
7. **Elastic IP** … 固定IP
8. **Key Pair** … SSH鍵

---

## 5. デプロイ作業の流れ（コマンドベース）

### 1) Terraform 初期化

```bash
cd /Users/macmini/Desktop/Cursor/infra
terraform init
# → AWSプロバイダのプラグインをDL
```

### 2) 構文チェック

```bash
terraform fmt       # コード整形
terraform validate  # 構文検証
```

### 3) プラン確認（重要）

```bash
terraform plan
# → 「何が作られるか」のプレビュー
# → ＋記号: 新規作成 / ～記号: 変更 / －記号: 削除
```

> **`plan` の差分を必ず読んでから `apply` する習慣を付けること。** 意図しない削除を防ぐ最後の砦。

### 4) 適用

```bash
terraform apply
# → 確認プロンプトで yes を入力
# → AWSが実際に作られる（数分かかる）
```

### 5) アプリのデプロイ（EC2 に入って）

```bash
# Terraformの出力からIPを取得してSSH
ssh -i ~/.ssh/task-board-key ec2-user@<EC2のIP>

# Docker / Docker Compose / Git をインストール
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
# Docker Compose のインストール...

# リポジトリをclone
git clone https://github.com/80-cloud/hideharu-AI.git
cd hideharu-AI/task-board

# 起動
docker-compose up -d
```

> ここは Terraform の守備範囲外（Terraform = インフラ層）。
> アプリのデプロイは EC2 起動時に自動実行する `user_data` スクリプトに移すのが次のステップ。

### 6) 動作確認

ブラウザで `http://<EC2のIP>` にアクセス。

### 7) 不要になったら必ず削除

```bash
terraform destroy
# → 全リソース削除。これを忘れると課金され続ける。
```

---

## 6. AI にコード生成させる際のコツ

Claude Code に依頼するときは、**1リソースずつ段階的に** 指示すると失敗が少ない。

```
× 「タスク管理ボードをAWSにデプロイするTerraformコードを全部書いて」
○ 「まずVPCとSubnetだけ作るmain.tfを書いて」
   → terraform plan / apply で動作確認
○ 「次にEC2インスタンスを追加して」
   → 確認
○ 「次にuser_dataでDockerを自動起動させて」
   → 確認
```

各ステップで `plan` の差分を読み、何が作られるか理解してから進めることで、IaC そのものの学習にもなる。

---

## 7. セキュリティ・コスト管理のチェックリスト

- [ ] ルートユーザーに MFA 設定済み
- [ ] 普段は IAM ユーザーで作業
- [ ] アクセスキーを Git にコミットしない（`.gitignore` に `*.tfvars`、`.terraform/`、`*.tfstate*` を追加）
- [ ] AWS Budgets で 1USD アラート設定済み
- [ ] Security Group は **自分の IP からのみ SSH 許可**（`0.0.0.0/0` で SSH 開放は厳禁）
- [ ] 作業終了後 `terraform destroy` を習慣化（学習中で常時起動不要なら毎回削除がベスト）
- [ ] `terraform.tfstate` ファイルにはシークレットが含まれることがある → Git に上げない

---

## 8. 学習リソース

- AWS 公式：[AWS無料利用枠](https://aws.amazon.com/jp/free/)
- Terraform 公式：[AWS Provider ドキュメント](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- 入門書：『Pragmatic Terraform on AWS』（無料枠でハンズオン中心、初学者向け）

---

## 9. 次のアクション（推奨ステップ）

1. **`infra/` ディレクトリと最小構成 main.tf を作成**（VPC + Subnet + EC2 のみ）
2. `terraform plan` で挙動確認
3. SSH で EC2 に入って手動で Docker Compose を起動 → 動作確認
4. `user_data` スクリプトで自動化
5. （必要なら）独自ドメイン・HTTPS 化

> CLAUDE.md のワークフロー（Issue → ブランチ → PR）に沿って進めること。
> 例：`feature/#XX-aws-terraform-init` ブランチで infra/ を作成 → PR → main へマージ
