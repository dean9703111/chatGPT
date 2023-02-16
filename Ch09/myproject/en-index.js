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