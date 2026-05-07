# 2026-05-07 application.yml に DB パスワードを平文ハードコード

**Phase:** 3 (PR #50 マージ前に発覚)
**ステータス:** Open（PR #50 内で修正予定）

---

## 症状（Symptoms）

EC2 にアプリが正常デプロイされ動作確認まで完了した後、ユーザーから「講座では RDS 接続前に commit/push しないと指導されたが、なぜか動いている」と指摘あり。

`application.yml` を確認すると：

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/taskboard
    username: taskboard
    password: taskboard          # ← ⚠️ 平文パスワード
```

DB認証情報が **平文でリポジトリにコミットされた状態** で push 済み（公開リポジトリ）。

## 兆候（Early Signs）— 次回検知用

- 設定ファイル（application.yml / .properties / .env / .json）に **直値の credentials** が含まれている
- `${VAR:default}` 形式の環境変数参照が **使われていない**
- `.gitignore` に `*.env` / `secrets.*` が含まれていない
- pre-commit hook（gitleaks 等）が **未設定**
- docker-compose.yml に `POSTGRES_PASSWORD: 値` 形式（`${VAR}` 参照ではない）

## 真因（Root Cause）

「**インフラ層**（Terraform / user_data）と **アプリ層**（application.yml）を別物として扱い、デプロイ時のクロスレイヤー監査プロセスが存在しなかった」

5 Whys：
1. なぜ平文パスワードが push されたか → application.yml に最初から書かれていた
2. なぜ書かれていた → ローカル開発用の素朴な設定が放置
3. なぜ修正前に push したか → デプロイ作業時にアプリ側のコードを監査しなかった
4. なぜ監査しなかったか → デプロイ前チェックリストに「機密情報スキャン」が無かった
5. なぜチェックリストに無かったか → **インフラ作業とアプリ作業が独立しており、境界の監査責任が誰にも割り当てられていなかった**

## 関連パターン

- **「機密情報漏洩」系**
- 関連：API キー Front 埋め込み / 接続文字列ハードコード / .env の commit
- (未抽出) → 将来 `patterns/pattern-secret-leak.md` として抽象化予定

## 是正処置（Remediation）

PR #50 内で以下を追加コミット予定：

1. `application.yml` を環境変数駆動に：
   ```yaml
   url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/taskboard}
   username: ${DATABASE_USERNAME:taskboard}
   password: ${DATABASE_PASSWORD:taskboard}
   ```
2. `docker-compose.yml` を `${POSTGRES_PASSWORD}` 等の変数参照に
3. `.env.example` 新規作成、`.env` を `.gitignore` に追加
4. `start.sh` / `user_data.sh` で env 注入

**Phase 4 で RDS 移行する際は、application.yml は変更不要**（環境変数の値だけ変える）。

## 再発防止（Prevention / Jidoka）

- **CI に gitleaks / detect-secrets を導入**（pre-commit / GitHub Actions）
- CLAUDE.md に **「デプロイ前チェックリスト」** セクション追加
  - [ ] 設定ファイルに平文 credentials が無いか grep
  - [ ] `${VAR}` 形式で外部化されているか
  - [ ] .env は .gitignore 対象か
- メモリに **「デプロイ時はクロスレイヤー監査必須」** ルールを追加（横展開）
- 本インシデント自体を **Phase 4 以降の比較ベースライン** として保持
