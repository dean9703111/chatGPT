# Ch8	靠問 ChatGPT 寫程式，能完成 OpenAI & LINE Bot 的 Side Project 嗎？（上）

### 8.1	詢問 ChatGPT 實作的步驟

`我想用 Node.js 寫一個在 Line 上面使用 ChatGPT 的程式，請告訴我具體步驟。`

### 8.2	前置作業 1：申請 OpenAI API key

**SETP 1**：進入 OpenAI 官網：https://openai.com/api/

### 8.3	前置作業 2：取得 LINE 的 Channel access token 和 Channel secret

`在 LINE 的開發者平台中，如何取得 Channel access token 和 Channel secret`

**SETP 1**：登入開發者平台（原則上有LINE的帳號就可以直接登入），網址：https://developers.line.biz/zh-hant


### 8.4	建立 OpenAI-LINE Bot 的 Node.js 專案

> 如果讀者的環境尚未安裝 Node.js 與 npm，接下來的操作會卡住。
> 筆者過去有寫一篇基礎環境設定的文章：「[工程師的開發環境大補帖：Node.js、NVM、git、yarn、VSCode](https://medium.com/dean-lin/3f21ea161898」，大家可以參考看看。

**SETP 1**：在終端機輸入 `mkdir myproject` 建立一個新的專案目錄。  

**SETP 2**：接著輸入 `cd myproject` 進入該目錄。  

**SETP 3**：輸入 `npm init` 建立一個 package.json 檔案，並設定專案的相關資訊（全部按 enter採默認值也可以）。  

**SETP 4**：安裝 "openai"、"@line/bot-sdk"、"express" 等套件  
```
npm install openai @line/bot-sdk express
```
**SETP 5**：輸入 `touch index.js` 建立一個新的檔案放程式碼。  

**SETP 6**：在 index.js 中引用所需的套件，並設定 OpenAI 的 API key、LINE Bot 的 channelAccessToken、channelSecret。  
```js
const openai = require('openai');
const line = require('@line/bot-sdk');

openai.apiKey = "YOUR_OPENAI_API_KEY";

const config = {
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN',
  channelSecret: 'YOUR_CHANNEL_SECRET'
};

const client = new line.Client(config);
```

**SETP 7**：在 index.js 中建立一個 HTTP server 並設定 line 的 webhook。  
```js
const express = require('express');
const app = express();
const port = 3000;

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
```

**SETP 8**：在 index.js 中建立一個事件處理函式，當使用者發送訊息時，使用 OpenAI API 將訊息傳給 ChatGPT，並將回應的結果傳回給使用者。  
```js
function handleEvent (event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  return openai.Completion.create({
    engine: "text-davinci-002",
    prompt: event.message.text,
  }).then(response => {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: response.choices[0].text
    });
  });
}
```

**SETP 9**：啟動伺服器 `node index.js`。

### 8.5	小結：一切沒有想像中的順利

`我按造步驟執行後，會噴錯誤：「TypeError: line.Client is not a constructor」`

`我調整後，會噴錯誤：「TypeError: Cannot read properties of undefined (reading 'validateSignature')」`

參考資料：
1.	[本篇文章的程式碼](https://github.com/dean9703111/chatGPT/tree/master/Ch08/myproject)