// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   res.end('Hello, World!\n');
// });

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
const express = require('express');
const bodyParser = require('body-parser');
//const cors = require('cors');
const db = require('./query');
const linebot = require('linebot');

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
console.log('port:', port)


let bot = linebot({
  channelId: process.env.LINE_CHANNELID,
  channelSecret: process.env.LINE_CHANNELSECRET,
  channelAccessToken: process.env.LINE_CHANNELACCESSTOKEN
});

//console.log('bot:', bot)
const linebotParser = bot.parser();
console.log('bot:', bot, linebotParser)
//app.use(cors())
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//line webhook
app.post('/linewebhook', linebotParser);

app.get('/',(req, res, next)=>{
  //res.json({info: 'hihi'})
  console.log('first request')
  next();
},(req, res)=>{
  res.json({info: 'hi2hi2'})
});
app.get('/user/:userId/:id', db.queryImageById);
app.post('/users', db.insertImage);

app.listen(port,()=>{
  console.log('app is working')
});