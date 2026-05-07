# =====================================================================
# variables.tf — Terraform で使う変数の宣言
# =====================================================================
# 値の実体は terraform.tfvars に書く（このファイルは Git 管理外）。
# default を持たない変数は、tfvars に書かないと apply できない。
# =====================================================================

variable "aws_region" {
  description = "AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "リソース名のプレフィックスに使うプロジェクト名"
  type        = string
  default     = "task-board"
}

variable "environment" {
  description = "環境識別子（dev/stg/prod 等）"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "VPC の CIDR ブロック"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "パブリックサブネットの CIDR ブロック"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "サブネットを配置する AZ"
  type        = string
  default     = "ap-northeast-1a"
}

variable "instance_type" {
  description = "EC2 インスタンスタイプ（ap-northeast-1 の無料枠は t3.micro / t4g.micro 等。t2.micro は2024年以降 Free Tier 対象外）"
  type        = string
  default     = "t3.micro"
}

variable "ssh_public_key_path" {
  description = "AWS Key Pair に登録する SSH 公開鍵のローカルパス"
  type        = string
  default     = "~/.ssh/aws-task-board.pub"
}

variable "my_ip_cidr" {
  description = "全ingress(SSH/フロント/API)を許可する送信元 CIDR（自分のPCのグローバルIP /32 必須。0.0.0.0/0 は禁止）"
  type        = string
  # default 無し：terraform.tfvars で必ず明示すること

  validation {
    condition     = var.my_ip_cidr != "0.0.0.0/0"
    error_message = "my_ip_cidr に 0.0.0.0/0 は指定できません（全世界開放は禁止）。"
  }
}

# --- RDS 関連 ---

variable "public_subnet_b_cidr" {
  description = "RDS Subnet Group 用の2つ目のパブリックサブネット CIDR（別AZ）"
  type        = string
  default     = "10.0.2.0/24"
}

variable "availability_zone_b" {
  description = "2つ目のサブネットを置く AZ（既存サブネットと別AZ）"
  type        = string
  default     = "ap-northeast-1c"
}

variable "db_engine_version" {
  description = "PostgreSQL のバージョン"
  type        = string
  default     = "16.10"
}

variable "db_instance_class" {
  description = "RDS インスタンスタイプ（無料枠は db.t3.micro）"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS ストレージ容量(GB)（無料枠は20GBまで）"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "RDS の初期データベース名"
  type        = string
  default     = "taskboard"
}

variable "db_username" {
  description = "RDS のマスターユーザー名"
  type        = string
  default     = "taskboard"
}

variable "db_password" {
  description = "RDS のマスターパスワード（terraform.tfvarsで指定。最低8文字）"
  type        = string
  sensitive   = true
  # default 無し：terraform.tfvars で必ず明示すること

  validation {
    condition     = length(var.db_password) >= 8
    error_message = "db_password は8文字以上で指定してください。"
  }
}
