#!/bin/bash
# =====================================================================
# user_data.sh — EC2 初回起動時の cloud-init スクリプト
# =====================================================================
# このスクリプトは EC2 が起動した直後に root 権限で1回だけ実行される。
# ログは /var/log/cloud-init-output.log で確認可能。
# 実行時のディレクトリは / なので、cd で移動するか絶対パスを使うこと。
# =====================================================================
set -euxo pipefail

# 全出力を cloud-init のログに集約
exec > >(tee -a /var/log/cloud-init-output.log) 2>&1

echo "===== user_data started: $(date -Iseconds) ====="

# ---------------------------------------------------------------------
# 1. システム更新と基本ツール
# ---------------------------------------------------------------------
# 注意: Amazon Linux 2023 には curl-minimal がプリインストール済み。
#       curl を明示インストールすると curl-minimal と競合してエラーになるので含めない。
#       tar/gzip も AL2023 標準で入っているため省略。
dnf update -y
dnf install -y git

# ---------------------------------------------------------------------
# 2. Amazon Corretto 25 (JDK)
# ---------------------------------------------------------------------
echo "===== Installing Amazon Corretto 25 ====="
rpm --import https://yum.corretto.aws/corretto.key
curl -fsSL https://yum.corretto.aws/corretto.repo -o /etc/yum.repos.d/corretto.repo
dnf install -y java-25-amazon-corretto-devel

# ---------------------------------------------------------------------
# 3. Node.js 22 (NodeSource RPM)
# ---------------------------------------------------------------------
echo "===== Installing Node.js 22 ====="
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs

# ---------------------------------------------------------------------
# 4. Docker + Compose v2 plugin
# ---------------------------------------------------------------------
echo "===== Installing Docker ====="
dnf install -y docker
systemctl enable --now docker
usermod -aG docker ec2-user

echo "===== Installing Docker Compose v2 plugin ====="
DOCKER_PLUGINS=/usr/local/lib/docker/cli-plugins
mkdir -p "$DOCKER_PLUGINS"
ARCH=$(uname -m)
curl -fsSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${ARCH}" \
  -o "${DOCKER_PLUGINS}/docker-compose"
chmod +x "${DOCKER_PLUGINS}/docker-compose"

# ---------------------------------------------------------------------
# 5. インストール結果の検証ログ出力
# ---------------------------------------------------------------------
echo "===== Verification ====="
java --version
javac --version
node --version
npm --version
docker --version
docker compose version
git --version

echo "===== user_data finished: $(date -Iseconds) ====="
