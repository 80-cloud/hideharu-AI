#!/bin/bash
# =====================================================================
# start.sh — EC2 上でアプリ全層を起動するスクリプト
# =====================================================================
# 使い方:
#   ec2-user で SSH ログイン後、ホームディレクトリ直下で実行:
#     ./start.sh
#
# 起動順:
#   1. PostgreSQL（Docker compose、healthcheck 待ち）
#   2. Spring Boot（gradlew bootRun、バックグラウンド）
#   3. Vite dev server（npm run dev、バックグラウンド）
#
# ログ:
#   $HOME/backend.log / $HOME/frontend.log
#   PIDファイル: $HOME/backend.pid / $HOME/frontend.pid
# =====================================================================
set -euo pipefail

# ---------------------------------------------------------------------
# 環境変数の読み込み（~/.env が存在すれば自動 export）
# ---------------------------------------------------------------------
# ~/.env に DATABASE_URL / DATABASE_USERNAME / DATABASE_PASSWORD を
# 定義しておくと、Spring Boot がそれを読んで RDS に接続する。
# ファイルが無い場合は application.yml の default (localhost) にフォールバック
# = docker-compose の PostgreSQL を使う動作になる。
# ---------------------------------------------------------------------
if [ -f "$HOME/.env" ]; then
  set -a # この後 source した変数を自動 export
  # shellcheck disable=SC1091
  source "$HOME/.env"
  set +a
  echo "✅ ~/.env を読み込みました（DB接続先: ${DATABASE_URL:-未設定}）"
else
  echo "⚠️ ~/.env が無いため docker-postgres にフォールバック"
fi

REPO_DIR="$HOME/hideharu-AI/task-board"
BACKEND_LOG="$HOME/backend.log"
FRONTEND_LOG="$HOME/frontend.log"
BACKEND_PID="$HOME/backend.pid"
FRONTEND_PID="$HOME/frontend.pid"

if [ ! -d "$REPO_DIR" ]; then
  echo "ERROR: $REPO_DIR が存在しません。user_data の clone が失敗している可能性があります。"
  exit 1
fi

# ---------------------------------------------------------------------
# 1. PostgreSQL 起動
# ---------------------------------------------------------------------
echo "===== [1/3] PostgreSQL を起動 ====="
cd "$REPO_DIR"
docker compose up -d

echo "PostgreSQL の healthcheck OK を待機..."
for i in $(seq 1 30); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' taskboard-db 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    echo "  ✅ PostgreSQL healthy (${i}回目)"
    break
  fi
  echo "  待機中 ($i/30): $STATUS"
  sleep 2
done

# ---------------------------------------------------------------------
# 2. Spring Boot 起動（バックグラウンド）
# ---------------------------------------------------------------------
echo "===== [2/3] Spring Boot を起動 ====="
cd "$REPO_DIR/backend"

# 既存のプロセスがあれば停止
if [ -f "$BACKEND_PID" ] && kill -0 "$(cat "$BACKEND_PID")" 2>/dev/null; then
  echo "既存のbackendプロセスを停止: $(cat "$BACKEND_PID")"
  kill "$(cat "$BACKEND_PID")" || true
  sleep 2
fi

nohup ./gradlew bootRun > "$BACKEND_LOG" 2>&1 &
echo $! > "$BACKEND_PID"
echo "  Spring Boot 起動 (PID: $(cat "$BACKEND_PID"))"

echo "Spring Boot の起動完了を待機（最大2分）..."
for i in $(seq 1 60); do
  if curl -fsS -o /dev/null http://localhost:8080/actuator/health 2>/dev/null \
     || curl -fsS -o /dev/null http://localhost:8080/api/tasks 2>/dev/null; then
    echo "  ✅ Spring Boot 応答開始 (${i}回目)"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "  ⚠️ 2分待っても応答なし。ログ確認: tail -f $BACKEND_LOG"
  fi
  sleep 2
done

# ---------------------------------------------------------------------
# 3. Vite (フロントエンド) 起動
# ---------------------------------------------------------------------
echo "===== [3/3] Vite (フロントエンド) を起動 ====="
cd "$REPO_DIR/frontend"

if [ ! -d node_modules ]; then
  echo "node_modules が無いため npm install を実行..."
  npm install
fi

if [ -f "$FRONTEND_PID" ] && kill -0 "$(cat "$FRONTEND_PID")" 2>/dev/null; then
  echo "既存のfrontendプロセスを停止: $(cat "$FRONTEND_PID")"
  kill "$(cat "$FRONTEND_PID")" || true
  sleep 2
fi

nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
echo $! > "$FRONTEND_PID"
echo "  Vite 起動 (PID: $(cat "$FRONTEND_PID"))"

echo ""
echo "===== 起動完了 ====="
echo "  ログ確認:"
echo "    tail -f $BACKEND_LOG"
echo "    tail -f $FRONTEND_LOG"
echo "  停止方法:"
echo "    kill \$(cat $BACKEND_PID)"
echo "    kill \$(cat $FRONTEND_PID)"
echo "    cd $REPO_DIR && docker compose down"
echo ""
echo "  ブラウザで http://<EIP>:5173 にアクセスしてください。"
