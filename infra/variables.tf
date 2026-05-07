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
