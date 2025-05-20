Slackボットの作り方

---

## ✅ ゴール：

> 「SlackでURLを投稿 → ボットが要約して返信」する流れのための **Slackボットの作成手順**

---

## 🔧 ステップ1：Slack App（ボット）の作成

### ① [Slack API管理ページ](https://api.slack.com/apps) にアクセス

→ ログインして「Create New App」をクリック

### ② Appの作成方法を選択

* 「From scratch」を選ぶ
* App Name：`summary-bot` など適当でOK
* Workspace：使いたいSlackワークスペースを選択

---

## 🧩 ステップ2：機能と権限の設定（Bot Token Scope）

### ① 左メニュー「**OAuth & Permissions**」を選択

下の方にある **Scopes > Bot Token Scopes** に以下を追加：

| 権限                  | 説明                   |
| ------------------- | -------------------- |
| `chat:write`        | ボットがメッセージを送信できるようにする |
| `chat:write.public` | 任意のチャンネルに投稿可能にする     |
| `channels:read`     | チャンネル一覧の取得（任意）       |
| `commands`          | スラッシュコマンドが必要なら（任意）   |
| `app_mentions:read` | メンション時の反応を取るなら       |

---

## 🔗 ステップ3：イベントの設定（URL検知・ボタン対応）

### ① 「**Event Subscriptions**」を有効にする

* **Request URL**：後で作るサーバー（例：Cloud Functionsやローカルのngrok）のURLを入れる
* 「Subscribe to bot events」→ 例：`message.channels` を追加

※ 最初は仮のエンドポイントでもOK（認証通すため）

---

## 🔑 ステップ4：アプリをワークスペースにインストール

* 左メニュー「**OAuth & Permissions**」 → 「**Install to Workspace**」をクリック
* 許可を確認してインストール
* 成功すると「Bot User OAuth Token」が表示されるので控えておく（例：`xoxb-...`）

---

## ⚙ ステップ5：Botのロジックを開発

開発方法は Python / Node.js など選べる。
とりあえず Python + Flask + Slack Bolt での最小コード例👇

```python
from flask import Flask, request
from slack_bolt import App
from slack_bolt.adapter.flask import SlackRequestHandler

import os

app = App(token=os.environ["SLACK_BOT_TOKEN"], signing_secret=os.environ["SLACK_SIGNING_SECRET"])
handler = SlackRequestHandler(app)

@app.event("message")
def handle_message_events(body, say):
    text = body["event"].get("text", "")
    if text.startswith("http"):
        say("このURLを要約しますか？", blocks=[
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {"type": "plain_text", "text": "要約する"},
                        "value": text,
                        "action_id": "summarize_button"
                    }
                ]
            }
        ])

@app.action("summarize_button")
def handle_summarize_action(ack, body, say):
    ack()
    url = body["actions"][0]["value"]
    summary = "ここに要約結果を入れる処理を実装"
    say(f"🔗 {url}\n📝 要約：{summary}")

flask_app = Flask(__name__)

@flask_app.route("/slack/events", methods=["POST"])
def slack_events():
    return handler.handle(request)
```

---

## ☁️ ステップ6：サーバーにデプロイ（選択）

| 方法                          | 解説                             |
| --------------------------- | ------------------------------ |
| ローカル + ngrok                | 開発中に便利（トンネルURLをRequest URLに設定） |
| Cloud Functions / Cloud Run | GCP環境に簡単デプロイできる                |
| Vercel / Render / Fly.io    | Node.js向き、無料枠あり                |

---

## ✅ まとめ：最短でSlackボットを作る手順

| ステップ | 内容                            |
| ---- | ----------------------------- |
| 1    | Slack APIでアプリを作成              |
| 2    | Botの権限（Scopes）を設定             |
| 3    | Event SubscriptionでURLを受け取る設定 |
| 4    | ワークスペースにインストール                |
| 5    | Flask/BoltなどでBotを実装           |
| 6    | サーバーにデプロイ or ngrokで公開URL用意    |

---

次に「要約処理（Gemini APIやOpenAIを使う）」の部分を実装したいなら、
そのコードもまるごと書いてやっぞ！どうする？次行くか？

<!-- ------------------------------------------------------------------------------- -->
<!-- ------------------------------------------------------------------------------- -->
<!-- ------------------------------------------------------------------------------- -->

Slackボットの\*\*作成〜デプロイ〜コード管理（Git）\*\*まで、オラがまるっと手順を整理する

---

## ✅ 全体フロー概要

```plaintext
1. Slackアプリ作成（Slack公式サイト）
2. ボットの実装（Python + Flask + Slack Bolt + Gemini API）
3. Gitでコード管理（GitHub）
4. ngrok や Cloud Runで公開
5. デプロイ・運用（本番環境対応）
```

---

## 🔧 ステップ1：Slackアプリの作成

1. [Slack API: Your Apps](https://api.slack.com/apps) にアクセス

2. 「Create New App」→ 「From scratch」選択

3. 名前を入力（例：`summarize-bot`）、ワークスペースを選択

4. 左メニュー「OAuth & Permissions」へ進み、次の Bot Token Scopes を追加：

   ```
   chat:write
   chat:write.public
   app_mentions:read
   channels:history
   ```

5. 「Event Subscriptions」→ 有効化 → Request URL を設定（あとで使う）

6. Subscribe to bot events に `message.channels` を追加

7. 「Install to Workspace」からインストール → `Bot User OAuth Token` を控える（例：`xoxb-...`）

---

## 🛠 ステップ2：ローカルでボットを実装

### ✅ 必要ライブラリのインストール

```bash
pip install slack_bolt flask requests beautifulsoup4 google-generativeai python-dotenv
```

### ✅ ディレクトリ構成（Git用）

```
summarize-bot/
├── app.py
├── .env
├── requirements.txt
└── README.md
```

### ✅ `.env` ファイル（秘密情報）

```
SLACK_BOT_TOKEN=xoxb-***
SLACK_SIGNING_SECRET=***
GEMINI_API_KEY=***
```

### ✅ `app.py`（基本コード）

```python
import os
from flask import Flask, request
from slack_bolt import App
from slack_bolt.adapter.flask import SlackRequestHandler
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

slack_app = App(token=os.getenv("SLACK_BOT_TOKEN"), signing_secret=os.getenv("SLACK_SIGNING_SECRET"))
handler = SlackRequestHandler(slack_app)
flask_app = Flask(__name__)

@slack_app.event("message")
def handle_message(event, say):
    text = event.get("text", "")
    if text.startswith("http"):
        say(f"🔗 URLを確認しました。要約しますね...\n{text}")
        content = scrape_page(text)
        summary = summarize_text(content)
        say(f"📝 要約結果：\n{summary}")

def scrape_page(url):
    r = requests.get(url)
    soup = BeautifulSoup(r.text, "html.parser")
    return soup.get_text()

def summarize_text(text):
    res = model.generate_content(f"以下の文章をわかりやすく要約してください：\n{text[:3000]}")
    return res.text

@flask_app.route("/slack/events", methods=["POST"])
def slack_events():
    return handler.handle(request)
```

---

## 📦 ステップ3：Gitでコード管理

```bash
git init
git add .
git commit -m "initial Slack + Gemini bot"
git remote add origin git@github.com:yourname/summarize-bot.git
git push -u origin main
```

※ `.env` は `.gitignore` に必ず追加しておく！

---

## 🌐 ステップ4：ローカルテストとngrok公開（開発中）

```bash
ngrok http 3000
```

* 生成されたURLを Slack App の `Event Subscriptions > Request URL` に設定

---

## ☁️ ステップ5：本番運用（Cloud Runなど）

### GCPで Cloud Run を使うなら：

* `Dockerfile` を用意して Flask アプリをデプロイ
* GCP上に環境変数を設定（`.env`の内容）

---

## ✅ まとめ：手順一覧

| ステップ | 内容                                          |
| ---- | ------------------------------------------- |
| 1    | Slackアプリ作成・権限設定・イベント設定                      |
| 2    | Python + Flask + Slack Bolt + Gemini APIで実装 |
| 3    | GitHubなどでコード管理（秘密情報は.env）                   |
| 4    | ngrokまたはCloud Runで公開                        |
| 5    | 実運用と保守（例：エラーハンドリング追加など）                     |

---
