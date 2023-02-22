require('dotenv').config(); // 皆採用 .env 讀取
const line = require('@line/bot-sdk');
const express = require('express');

// 原案套件使用方式錯誤，我直接改掉
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

  return openai.createCompletion({ // 調整成正確的使用方法
    prompt: event.message.text,
    model: "text-davinci-003", // 應用 model 而非 engine
    max_tokens: 1000 // 應用 max_tokens 而非 maxTokens
  }).then((completions) => {
    // 原案少了 data 這層結構，還要加上 trim() 去除空白
    const message = completions.data.choices[0].text.trim();
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: message
    });
  });
}

app.listen(3000);
console.log('LINE Bot is running on 3000 port');