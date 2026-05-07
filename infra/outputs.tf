# =====================================================================
# outputs.tf — apply 後にターミナルに表示する値
# =====================================================================
# `terraform output` でいつでも再表示可能
# =====================================================================

output "vpc_id" {
  description = "作成された VPC の ID"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "パブリックサブネットの ID"
  value       = aws_subnet.public.id
}

output "ec2_instance_id" {
  description = "EC2 インスタンスの ID"
  value       = aws_instance.app.id
}

output "ec2_ami_id" {
  description = "使用された Amazon Linux 2023 AMI ID"
  value       = data.aws_ami.amazon_linux_2023.id
}

output "ec2_public_ip" {
  description = "EC2 のパブリック IP（Elastic IP）"
  value       = aws_eip.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2 のパブリック DNS"
  value       = aws_instance.app.public_dns
}

output "ssh_command" {
  description = "EC2 へ SSH 接続するためのコマンド（コピペで使える）"
  value       = "ssh -i ${var.ssh_public_key_path == "~/.ssh/aws-task-board.pub" ? "~/.ssh/aws-task-board" : replace(var.ssh_public_key_path, ".pub", "")} ec2-user@${aws_eip.app.public_ip}"
}

# --- RDS 関連 ---

output "rds_endpoint" {
  description = "RDS 接続エンドポイント（host:port 形式）"
  value       = aws_db_instance.main.endpoint
}

output "rds_address" {
  description = "RDS のホスト名のみ（psql 接続時に使用）"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS のポート番号"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "初期DB名"
  value       = aws_db_instance.main.db_name
}

output "psql_command" {
  description = "EC2 から RDS に psql で接続するためのコマンドテンプレート"
  value       = "psql -h ${aws_db_instance.main.address} -p ${aws_db_instance.main.port} -U ${var.db_username} -d ${var.db_name}"
}
