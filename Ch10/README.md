# Ch10 工程師福音！讓 ChatGPT 來協助 Code Review、Refactoring、Comments

### 10.1 直接把程式碼丟進 ChatGPT 會發生什麼事？

把程式的「註解」都拿掉：
```js
require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");
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

app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  return openai
    .createCompletion({
      prompt: event.message.text,
      model: "text-davinci-003",
      max_tokens: 1000,
    })
    .then((completions) => {
      const message = completions.data.choices[0].text.trim();
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: message,
      });
    });
}

app.listen(3000);
console.log("LINE Bot is running on 3000 port");
```

### 10.2	讓 ChatGPT 用中文解釋程式（Review and explain）

`Review code and explain in traditional Chinese [List of points]`

### 10.3 用 ChatGPT 重構程式（Refactoring）

`Refactoring the code and explain in traditional Chinese`

下面是 ChatGPT 重構後的程式：
```js
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
```

把 line 設定 config 的部分調整回來

```js
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);
app.post('/webhook', line.middleware(config), async (req, res) => {
  // code..
}
```

### 10.4 用 ChatGPT 幫程式加上註解（Comments）

加上註解：`add code comments`

```js
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
```

移除所有註解：`remove code comments`

### 參考資料
1.	[ChatGPT Refactor 後的程式](https://github.com/dean9703111/chatGPT/blob/master/Ch10/myproject/refactor-index.js)
2.	[ChatGPT Refactor 並加上註解的程式](https://github.com/dean9703111/chatGPT/blob/master/Ch10/myproject/commemt-index.js)