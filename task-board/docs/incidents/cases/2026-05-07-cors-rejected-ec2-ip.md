# 2026-05-07 CORS 設定が EC2 EIP を許可しておらず POST 失敗

**Phase:** 4.5 (RDS 連携後のブラウザ動作確認時に発覚)
**ステータス:** Resolved（commit 予定 / Issue #52 内）

---

## 症状（Symptoms）

ブラウザで `http://54.150.151.67:5173` のタスクボードにアクセスし、新規タスク追加ボタンを押すと：

```
ネットワークエラーが発生しました。バックエンドが起動しているか確認してください。
```

実際にはバックエンドは正常稼働中（`curl http://54.150.151.67:8080/api/tasks` は HTTP 200）。
GET /api/tasks（既存タスク取得）は動くが、POST が失敗。

curl で再現：
```
curl -X POST -H "Content-Type: application/json" -H "Origin: http://54.150.151.67:5173" \
  http://54.150.151.67:5173/api/tasks
→ HTTP 403 / "Invalid CORS request"
```

## 兆候（Early Signs）— 次回検知用

- フロントエンドの URL とバックエンドの「許可オリジン」が**一致していない**
- `CorsConfig.java` に **特定の URL がハードコード** されている
- フロント・バック分離構成で IP / FQDN が変わるたびに CORS 修正が発生
- GET は動くが **POST/PUT/DELETE で 403**（preflight が失敗）
- レスポンスヘッダ `Vary: Origin` + body `Invalid CORS request`

## 真因（Root Cause）

`CorsConfig.java` で `allowedOrigins("http://localhost:5173")` のみハードコードされていた。

ローカル開発（`http://localhost:5173`）では問題なかったが、EC2 デプロイ後はブラウザのオリジンが `http://54.150.151.67:5173` になり、Spring Security の CorsFilter が拒否。

「**CORS 設定もハードコードされていた、けどローカルでは動くので気づきにくい**」というパターン。env-var 化の対象に含めるべきだったが Phase 4.5 計画から漏れていた（DB 認証情報には目が行ったが CORS は盲点）。

## 関連パターン

- 「環境固有設定のハードコード」系
- 関連: DB password ハードコード（同じ Phase 4.5 で解消済）/ baseURL ハードコード / IP allowlist ハードコード
- (未抽出) → 将来 `patterns/pattern-environment-specific-hardcode.md` として抽象化予定

## 是正処置（Remediation）

実施済み（Phase 4.5 内で追加修正）：

1. `CorsConfig.java` を `@Value("${cors.allowed-origins:default}")` で env-var 駆動に
2. `application.yml` に `cors.allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:5173}` を追加
3. `.env.example` に `CORS_ALLOWED_ORIGINS` のサンプルを追加（カンマ区切り複数）
4. EC2 上の `~/.env` に `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://54.150.151.67:5173` を追記
5. Spring Boot を再起動して動作確認（ブラウザから新規タスク追加成功）

## 再発防止（Prevention / Jidoka）

- **デプロイ前監査チェックリストに「環境固有のハードコード grep」を追加**
  - `grep -rE "(localhost|127\\.0\\.0\\.1|http://[0-9]+\\.)" src/`
  - DB URL / CORS / API base URL / S3 bucket name 等
- **GET だけでなく POST/PUT/DELETE もブラウザで確認** する手順をデプロイ後検証に組み込む
  - GET は CORS preflight が不要なので問題に気づきにくい
- 環境変数で外部化する設定の **マスター一覧** を `task-board/docs/env-vars.md` で管理（将来）
- **CORS 設定の env-var 化はデフォルトのテンプレ化** （Spring Boot プロジェクトの標準スカフォールド）
