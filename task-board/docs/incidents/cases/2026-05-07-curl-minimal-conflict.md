# 2026-05-07 curl-minimal との競合で cloud-init が失敗

**Phase:** 2 (user_data 自動インストール)
**ステータス:** Resolved (commit `040aec2` で対応前の準備、別途修正)

---

## 症状（Symptoms）

`terraform apply` 後、cloud-init が `status: error` で失敗。
EC2 にツール群がインストールされず、Phase 2 の検証が進まない。

```
package curl-minimal-X.X.X conflicts with curl provided by curl-X.X.X
('scripts-user', RuntimeError('Runparts: 1 failures (part-001) in 1 attempted commands'))
```

## 兆候（Early Signs）— 次回検知用

- user_data.sh 内で `dnf install -y curl ...` のように **curl を明示インストール** している
- ターゲットOSが **Amazon Linux 2023**（古い AL2 とは挙動が異なる）
- `/var/log/cloud-init-output.log` に `conflicts with` の文字列

## 真因（Root Cause）

Amazon Linux 2023 には軽量版の **curl-minimal がプリインストール** されている。
`dnf install curl` を実行すると同じファイルを提供するパッケージが2つ存在することになり、競合エラーになる。
**過去の AL2 / CentOS の知識をそのまま AL2023 に適用したことが直接原因。**

## 関連パターン

- (未抽出) → 将来 `patterns/pattern-distro-defaults.md` として抽象化予定

## 是正処置（Remediation）

`infra/user_data.sh` から `curl` の install を削除：
```bash
# Before
dnf install -y git tar gzip curl
# After
dnf install -y git
```

注意コメントを追加し、AL2023 では curl-minimal を使う方針を明記。

## 再発防止（Prevention / Jidoka）

- **OS のプリインストールパッケージを `rpm -qa | grep <pkg>` で事前確認** する習慣
- user_data 変更時は **ローカルで `bash -n` + shellcheck だけでなく、最小VMで試走** すべき
- AL2023 と AL2 の差分（curl-minimal, dnf-vs-yum, systemd-resolved 等）を **distro-差分メモ** として残す
