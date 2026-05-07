# =====================================================================
# main.tf — Phase 1: VPC + EC2(t2.micro) を作る最小構成
# =====================================================================
# 段階方針：
#   Phase 1（本ファイル）: ネットワーク + EC2 起動 + SSH 接続まで
#   Phase 2: user_data で Docker 自動セットアップ
#   Phase 3: アプリのデプロイ（front+back 同居）
#   Phase 4: RDS 分離
#   Phase 5: S3 + CloudFront
# =====================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# ---------------------------------------------------------------------
# 共通タグ：全リソースに自動付与される（誤削除防止・コスト分析に有用）
# ---------------------------------------------------------------------
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  name_prefix = "${var.project_name}-${var.environment}"

  # SGで開放するingressポート一覧
  # すべて var.my_ip_cidr (自PC IP) からのみ許可される
  ingress_ports = [
    { name = "SSH", port = 22 },         # EC2管理用
    { name = "Vite", port = 5173 },      # フロントエンド (Vite dev server)
    { name = "SpringBoot", port = 8080 } # バックエンド (Spring Boot API)
  ]
}

# ---------------------------------------------------------------------
# 最新の Amazon Linux 2023 AMI を動的に取得
# AMI ID はリージョン・時期で変わるためハードコードしない
# ---------------------------------------------------------------------
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

# ---------------------------------------------------------------------
# VPC：仮想ネットワークの箱
# ---------------------------------------------------------------------
# 理由: 学習用途のためVPC Flow Logsは未有効化。CloudWatch Logsの課金が発生するため、
#       本番運用フェーズで必要になった時点で有効化する。
#tfsec:ignore:aws-ec2-require-vpc-flow-logs-for-all-vpcs
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

# ---------------------------------------------------------------------
# パブリックサブネット：EC2 を置く場所（インターネットから到達可能）
# ---------------------------------------------------------------------
# 理由: 本構成は意図的にパブリックサブネット。Webサーバー用途のため
#       パブリックIPが必要。プライベートサブネット+NATゲートウェイは無料枠超過につながる。
#tfsec:ignore:aws-ec2-no-public-ip-subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.name_prefix}-public-subnet"
  }
}

# ---------------------------------------------------------------------
# Internet Gateway：VPC からインターネットへの出口
# ---------------------------------------------------------------------
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${local.name_prefix}-igw"
  }
}

# ---------------------------------------------------------------------
# Route Table：「外向き(0.0.0.0/0)は IGW へ」のルートを定義
# ---------------------------------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${local.name_prefix}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ---------------------------------------------------------------------
# Security Group：ファイアウォール
#   ingress: 全て自PC IP(my_ip_cidr) からのみ許可
#     - 22   : SSH（EC2管理）
#     - 5173 : Vite dev server（フロントエンド）
#     - 8080 : Spring Boot API（バックエンド）
#   egress : 全送信許可（OS更新・Docker pull 等のため）
# 注意：5432(PostgreSQL) は外部公開しない。EC2内のDocker内部のみで通信。
# 80/443 は将来 nginx + TLS 構築フェーズで追加する（Phase 1 では不要）。
# ---------------------------------------------------------------------
# 理由: OS更新(yum)・Docker pull・外部API呼び出しのため全egress許可が必要。
#tfsec:ignore:aws-ec2-no-public-egress-sgr
resource "aws_security_group" "ec2" {
  name        = "${local.name_prefix}-ec2-sg"
  description = "Security group for task-board EC2 instance"
  vpc_id      = aws_vpc.main.id

  dynamic "ingress" {
    for_each = local.ingress_ports
    content {
      description = "${ingress.value.name} from my PC IP only"
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = "tcp"
      cidr_blocks = [var.my_ip_cidr]
    }
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.name_prefix}-ec2-sg"
  }
}

# ---------------------------------------------------------------------
# Key Pair：ローカルの公開鍵を AWS に登録
# 秘密鍵はローカル(~/.ssh/aws-task-board)、AWS には公開鍵のみ
# ---------------------------------------------------------------------
resource "aws_key_pair" "main" {
  key_name   = "${local.name_prefix}-key"
  public_key = file(pathexpand(var.ssh_public_key_path))

  tags = {
    Name = "${local.name_prefix}-key"
  }
}

# ---------------------------------------------------------------------
# EC2 Instance：本体
# ---------------------------------------------------------------------
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = aws_key_pair.main.key_name

  root_block_device {
    volume_size           = 8
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_tokens   = "required" # IMDSv2 強制（セキュリティベストプラクティス）
    http_endpoint = "enabled"
  }

  tags = {
    Name = "${local.name_prefix}-ec2"
  }
}

# ---------------------------------------------------------------------
# Elastic IP：EC2 を停止/起動しても変わらない固定 IP
# EC2 にアタッチして使う限り無料
# ---------------------------------------------------------------------
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name = "${local.name_prefix}-eip"
  }

  depends_on = [aws_internet_gateway.main]
}
