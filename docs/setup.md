# Slack App設定手順書

chatgptによる自動生成です。
誤りがあるかもしれません。

## 📋 概要

SlackでURLを投稿すると、ボットが自動的に要約して返信するSlackボットのためのSlack App設定手順です。

## 🎯 完成イメージ

1. ユーザーがSlackチャンネルにURLを投稿
2. ボットがURLの内容を取得・解析
3. Gemini APIを使って要約を生成
4. Slackに要約結果を返信

---

## 🔧 ステップ1：Slack App（ボット）の作成

### 1.1 Slack APIページでアプリを作成

1. [Slack API管理ページ](https://api.slack.com/apps) にアクセス
2. 「Create New App」をクリック
3. 「From scratch」を選択
4. App Name：`summary-bot`（任意の名前）
5. Workspace：使用するSlackワークスペースを選択

### 1.2 Bot Token Scopesの設定

1. 左メニュー「**OAuth & Permissions**」を選択
2. **Scopes > Bot Token Scopes** に以下を追加：

| 権限                  | 説明                   |
| ------------------- | -------------------- |
| `chat:write`        | ボットがメッセージを送信できるようにする |
| `chat:write.public` | 任意のチャンネルに投稿可能にする     |
| `channels:read`     | チャンネル一覧の取得           |
| `app_mentions:read` | メンション時の反応を取る         |
| `channels:history`  | チャンネル履歴の読み取り         |

### 1.3 Event Subscriptionsの設定

1. 左メニュー「**Event Subscriptions**」を選択
2. 「Enable Events」をオンにする
3. **Request URL**：GASでデプロイしたWebアプリのURLを設定
   - 例：`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
4. 「Subscribe to bot events」で `message.channels` を追加

### 1.4 ワークスペースにインストール

1. 左メニュー「**OAuth & Permissions**」
2. 「**Install to Workspace**」をクリック
3. 許可を確認してインストール
4. 表示される「**Bot User OAuth Token**」を控える（`xoxb-...`で始まる）
5. 「**Signing Secret**」も控える（Basic Information > App Credentialsにある）

---

## 🔧 ステップ2：GAS（Google Apps Script）の設定

### 2.1 GASプロジェクトの作成

1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を設定（例：`slack-url-summarizer`）

### 2.2 スクリプトプロパティの設定

1. 左メニュー「プロジェクトの設定」をクリック
2. 「スクリプト プロパティ」セクションで以下を追加：

| プロパティ名 | 値 |
| --- | --- |
| `SLACK_BOT_TOKEN` | `xoxb-...`（ステップ1.4で控えたトークン） |
| `SLACK_SIGNING_SECRET` | ステップ1.4で控えたSigning Secret |
| `GEMINI_API_KEY` | Google Gemini APIキー |

### 2.3 Webアプリとしてデプロイ

1. 右上の「デプロイ」→「新しいデプロイ」をクリック
2. 種類の選択で「ウェブアプリ」を選択
3. 説明：`Slack URL Summarizer`（任意）
4. 次のユーザーとして実行：「自分」
5. アクセスできるユーザー：「全員」
6. 「デプロイ」をクリック
7. 表示されるWebアプリのURLを控える

---

## 🔧 ステップ3：Slack AppとGASの連携

### 3.1 Request URLの設定

1. Slack API管理ページに戻る
2. 「Event Subscriptions」を選択
3. Request URLにGASのWebアプリURLを入力
4. 「Verify」ボタンをクリックして認証を確認

### 3.2 ボットをチャンネルに招待

1. Slackワークスペースで使用したいチャンネルを開く
2. チャンネル名をクリック→「インテグレーション」タブ
3. 「アプリを追加する」から作成したボットを選択
4. または、チャンネルで `/invite @ボット名` を実行

---

## ✅ 完了チェックリスト

- [ ] Slack Appの作成
- [ ] Bot Token Scopesの設定
- [ ] Event Subscriptionsの有効化
- [ ] ワークスペースへのインストール
- [ ] GASプロジェクトの作成
- [ ] スクリプトプロパティの設定
- [ ] Webアプリとしてデプロイ
- [ ] Request URLの設定と認証
- [ ] ボットのチャンネル招待

---

## 🔧 トラブルシューティング

### よくある問題と解決方法

1. **「url_verification」エラー**
   - Request URLの設定が正しいか確認
   - GASのWebアプリURLが正しく設定されているか確認
   - GASのアクセス権限が「全員」になっているか確認

2. **ボットが反応しない**
   - Bot Token Scopesが正しく設定されているか確認
   - ボットがチャンネルに招待されているか確認
   - Event Subscriptionsで `message.channels` が追加されているか確認

3. **認証エラー**
   - Bot TokenとSigning Secretが正しくGASのスクリプトプロパティに設定されているか確認
   - トークンに余分なスペースや改行が含まれていないか確認

4. **Gemini APIエラー**
   - Gemini API キーが正しく設定されているか確認
   - APIの利用制限に達していないか確認

---

## 📚 参考リンク

- [Slack API Documentation](https://api.slack.com/)
- [Google Apps Script](https://script.google.com/)
- [Google Gemini API](https://ai.google.dev/)
