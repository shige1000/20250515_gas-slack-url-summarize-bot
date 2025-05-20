function doPost(e) {
    try {
        const json = JSON.parse(e.postData.contents);

        // URL認証確認
        if (json.type === "url_verification") {
            return ContentService.createTextOutput(json.challenge).setMimeType(ContentService.MimeType.TEXT);
        }

        // botからの投稿は無視
        if (json.event && json.event.bot_id) {
            return ContentService.createTextOutput("bot message ignored");
        }

        const eventId = json.event_id;
        const userId = json.event?.user;
        const channelId = json.event?.channel;
        const messageText = json.event?.text;
        const threadTs = json.event?.ts;
        const props = PropertiesService.getScriptProperties();

        if (!eventId || !userId || !channelId || !messageText) {
            return ContentService.createTextOutput("missing info");
        }

        // イベントIDの重複チェック（過去に処理したイベントなら無視）
        if (props.getProperty(`event_${eventId}`)) {
            return ContentService.createTextOutput("duplicate event ignored");
        } else {
            props.setProperty(`event_${eventId}`, "processed");
        }

        const slackBotToken = props.getProperty('SLACK_BOT_TOKEN');
        const googleApiKey = props.getProperty('GOOGLE_AI_STUDIO_API_KEY');

        let replyText = "";

        // -y https 形式のときだけ要約する
        const urlMatch = messageText.match(/<?https?:\/\/\S+>?/);
        const startsWithCommand = messageText.startsWith("-y");

        if (startsWithCommand && urlMatch) {
            const url = urlMatch[0].replace(/^<|>$/g, "");
            const summary = summarizeUrlWithGemini(url, googleApiKey);
            replyText = `<@${userId}>\n${summary}`;
        } else {
            replyText = `<@${userId}>\nオプション\n【- y URL】：URLの内容を要約を行います。`;
        }

        const payload = {
            channel: channelId,
            text: replyText,
            thread_ts: threadTs
        };

        const options = {
            method: "post",
            headers: {
                Authorization: "Bearer " + slackBotToken,
                "Content-Type": "application/json"
            },
            payload: JSON.stringify(payload)
        };

        UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", options);

        return ContentService.createTextOutput("OK");
    } catch (error) {
        return ContentService.createTextOutput("error").setMimeType(ContentService.MimeType.TEXT);
    }
}

// Gemini API を使ってURLを要約する関数
function summarizeUrlWithGemini(url, apiKey) {
    const prompt = `
以下のWebサイトを調査し、以下の項目で箇条書きしてください。

- 会社名
- 連絡先・電話番号（正しいか不明な時は、調査結果不明とする）
- 社長名（正しいか不明な時は、調査結果不明とする）
- 資本金（正しいか不明な時は、調査結果不明とする）
- 事業内容（詳しく）
- この会社の強み
- この会社の弱み
- この会社に営業を行う時の注意点

URL: ${url}

分からない情報・正しいか不明な時は「調査結果不明」と記載してください。
URL先が会社のサイトで無い場合「会社のサイトではありません」とだけ、記載してください。
速さより、正確性を求めていますので、時間がかかっても大丈夫です。
`;

    const response = UrlFetchApp.fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const result = JSON.parse(response.getContentText());
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "要約に失敗しました。";
}
