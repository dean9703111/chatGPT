require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
});
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

app.post(
  "/webhook",
  line.middleware({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
  }),
  async (req, res) => {
    try {
      const results = await Promise.all(req.body.events.map(handleEvent));
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }
);

const handleEvent = async (event) => {
  if (event.type !== "message" || event.message.type !== "text") {
    return null;
  }

  const {
    data: { choices },
  } = await openai.createCompletion({
    prompt: event.message.text,
    model: "text-davinci-003",
    max_tokens: 1000,
  });

  const message = choices[0].text.trim();
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: message,
  });
};

app.listen(3000);
console.log("LINE Bot is running on 3000 port");