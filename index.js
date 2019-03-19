const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
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

app.use(cors())

//line webhook
const parser = bodyParser.json({
  verify: function (req, res, buf, encoding) {
    req.rawBody = buf.toString(encoding);
  }
});
app.use(parser)
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//line api
app.post('/linewebhook', parser, function (req, res) {
  
  if (!bot.verify(req.rawBody, req.get('X-Line-Signature'))) {
    return res.sendStatus(400);
  }
  console.log('linewebhook req:', req.body)
  bot.parse(req.body);
  return res.json({});
});



bot.on('message', function (event) {
  event.reply(event.message.text).then(function (data) {    
    console.log('Success', data);
  }).catch(function (error) {
    console.log('Error', error);
  });
});


app.get('/', (req, res, next) => {
  //res.json({info: 'hihi'})
  console.log('first request')
  next();
}, (req, res) => {
  res.json({ info: 'hi2hi2' })
});
app.get('/user/:userId/:id', db.queryImageById);
app.post('/users', db.insertImage);

app.listen(port, () => {
  console.log('app is working')
});