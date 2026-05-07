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
# 0. Swap領域の作成 (4GB)
# ---------------------------------------------------------------------
# 理由: t3.micro は RAM 1GB しかないため、Gradle daemon + Spring Boot
#       + Vite + PostgreSQL を同時稼働させると即 OOM/thrashing が起きる。
#       swap で物理メモリ不足を一時的に補う。
#       本番運用ではインスタンスサイズアップが望ましい。
# ---------------------------------------------------------------------
echo "===== Creating 4GB swap ====="
if ! swapon --show | grep -q swapfile; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  # スワップ使用優先度を下げる（RAM優先）
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf
  sysctl -p /etc/sysctl.d/99-swap.conf
fi
free -h

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
# 5. アプリリポジトリの clone（ec2-user 所有で配置）
# ---------------------------------------------------------------------
# 注意: 本Issue (#49) 対応中はテストのため feature ブランチを参照する。
# PR マージ後は GIT_BRANCH を main に戻すこと。
# ---------------------------------------------------------------------
echo "===== Cloning hideharu-AI repository ====="
GIT_BRANCH="feature/#49-aws-app-deploy"
sudo -u ec2-user git clone --branch "$GIT_BRANCH" \
  https://github.com/80-cloud/hideharu-AI.git \
  /home/ec2-user/hideharu-AI

# ---------------------------------------------------------------------
# 6. start.sh を ec2-user ホームに配置（infra/start.sh の中身を埋め込む）
# ---------------------------------------------------------------------
# user_data 内に埋め込むのではなく、clone したリポジトリ内 infra/start.sh を
# ec2-user ホームへコピーすることで、コードの単一ソースを保つ。
echo "===== Placing start.sh at /home/ec2-user/start.sh ====="
cp /home/ec2-user/hideharu-AI/infra/start.sh /home/ec2-user/start.sh
chown ec2-user:ec2-user /home/ec2-user/start.sh
chmod +x /home/ec2-user/start.sh

# ---------------------------------------------------------------------
# 7. インストール結果の検証ログ出力
# ---------------------------------------------------------------------
echo "===== Verification ====="
java --version
javac --version
node --version
npm --version
docker --version
docker compose version
git --version
ls -la /home/ec2-user/hideharu-AI
ls -la /home/ec2-user/start.sh

echo "===== user_data finished: $(date -Iseconds) ====="
