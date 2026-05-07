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
