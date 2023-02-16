require('dotenv').config();
const line = require('@line/bot-sdk');
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

// Initialize express app
const app = express();

// Get config values from environment variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// Initialize line client
const client = new line.Client(config);

// Initialize openai api
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

// Handle post requests to /webhook
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    // Map handleEvent function over all events and wait for all promises to resolve
    const results = await Promise.all(req.body.events.map(handleEvent));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// Handle a single event
const handleEvent = async (event) => {
  // Only handle message events of type text
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  // Get choices from openai response
  const { data: { choices } } = await openai.createCompletion({
    prompt: event.message.text,
    model: "text-davinci-003",
    max_tokens: 1000
  });

  // Send the first choice as a message reply
  const message = choices[0].text.trim;
  return client.replyMessage(event.replyToken, { type: 'text', text: message });
};

// Start listening on port 3000 
app.listen(3000);
console.log('LINE Bot is running on 3000 port');