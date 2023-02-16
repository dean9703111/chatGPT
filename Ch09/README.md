# Ch9	靠問 ChatGPT 寫程式，能完成 OpenAI & LINE Bot 的 Side Project 嗎？（下）

### 9.1	在 local 建立一個可以讓 Line 訪問的 HTTP server（ngrok）

`有辦法在 local 建立一個 HTTP server 並設定 Line 的 webhook 嗎`

`我目前使用 mac 系統，要如何使用 ngrok 呢？需要詳細步驟`

**SETP 1**：先到 ngrok 的官網下載 ngrok 的 Mac 版本：https://ngrok.com/download 。

**SETP 3**：打開終端機，輸入 `ngrok http 3000`

### 9.3	測試功能＆痛苦的 Debug 之路

```js
const line = require('@line/bot-sdk');
const express = require('express');
const openai = require('openai');

openai.apiKey = "YOUR_API_KEY";

const config = {
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN',
  channelSecret: 'YOUR_CHANNEL_SECRET'
};

const client = new line.Client(config);

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent (event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return openai
    .engines
    .completions
    .create({
      prompt: event.message.text,
      engine: "text-davinci-002",
      maxTokens: 100
    })
    .then((completions) => {
      const message = completions.choices[0].text;
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: message
      });
    });
}

app.listen(3000);
console.log('LINE Bot is running on 3000 port');
```

### 9.4	ChatGPT並不是萬能，Bug還得靠自己處理

openai 套件：https://www.npmjs.com/package/openai

官網給的範例程式：
```js
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const completion = await openai.createCompletion({
  model: "text-davinci-002",
  prompt: "Hello world",
});
console.log(completion.data.choices[0].text);
```

修改好的程式：
```js
require('dotenv').config(); // 皆採用 .env 讀取
const line = require('@line/bot-sdk');
const express = require('express');

// 他套件使用方式錯誤，我直接改掉
const { Configuration, OpenAIApi } = require("openai"); 
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent (event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return openai.createCompletion({ // 方法用錯修正
    prompt: event.message.text,
    model: "text-davinci-003", // 使用 model 而非 engine
    max_tokens: 1000 // 應用 max_tokens 而非 maxTokens
  }).then((completions) => {
    // 少了 data 這層結構，並要加上 trim() 去除空白
    const message = completions.data.choices[0].text.trim();
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: message
    });
  });
}

app.listen(3000);
console.log('LINE Bot is running on 3000 port');
```

### 參考資料：
1.	[用英文溝通 ChatGPT 得到的程式](https://github.com/dean9703111/chatGPT/blob/master/Ch09/myproject/en-index.js)
2.	[筆者自己優化得到的解答](https://github.com/dean9703111/chatGPT/blob/master/Ch09/myproject/index.js)
