# 2026-05-07 build.gradle と EC2 上 JDK のバージョン不整合

**Phase:** 3 (アプリ起動)
**ステータス:** Resolved (commit `040aec2`)

---

## 症状（Symptoms）

EC2 上で `./gradlew bootRun` 実行時、Gradle がビルド前にエラーで停止。

```
Cannot find a Java installation on your machine matching:
  {languageVersion=21, vendor=any vendor, ...}
Toolchain download repositories have not been configured.
```

Spring Boot は起動せず、ポート8080 は LISTEN しない。

## 兆候（Early Signs）— 次回検知用

- `build.gradle` の `JavaLanguageVersion.of(N)` と、EC2 にインストール済みの JDK バージョンが **一致しない**
- Gradle Toolchain は **互換性ではなく完全一致** を要求する仕様
- `dnf list installed | grep corretto` の結果と build.gradle が乖離

## 真因（Root Cause）

Phase 2 で `user_data.sh` に **Amazon Corretto 25 のみ** をインストール。
一方で `task-board/backend/build.gradle` は `JavaLanguageVersion.of(21)` を要求していた。
Gradle Toolchain は「Java 25 で 21 のコードを動かしてOK」と判断せず、**指定通りの21を厳格に探す**。

**インフラ側（EC2の Java）とアプリ側（build.gradle の指定）の整合性を取る前にデプロイしたことが直接原因。**

## 関連パターン

- 「クロスレイヤー整合性」系の問題
- 同種：docker image の base OS / アプリ要求 / OS依存ライブラリのズレ
- (未抽出) → 将来 `patterns/pattern-cross-layer-version.md` として抽象化予定

## 是正処置（Remediation）

`task-board/backend/build.gradle` の Java バージョンを 21 → 25 に更新：

```groovy
java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(25)
  }
}
```

EC2 上で `git pull` してから `./gradlew bootRun` を再実行 → 正常起動を確認。

## 再発防止（Prevention / Jidoka）

- **デプロイ前チェックリストに「ランタイム要求の整合性確認」を追加**
  - build.gradle / package.json の `engines` / Dockerfile の base image
  - vs user_data でインストールしたバージョン
- 一覧化：「**バージョン台帳**」を `task-board/docs/version-matrix.md` として整備
  （アプリ要求・EC2 実体・docker image を一覧で並べ、定期確認）
- CI で「`build.gradle` と user_data の Java バージョンが一致するか」をチェックするスクリプト追加（将来）
