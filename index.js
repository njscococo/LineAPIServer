const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./query');
const linebot = require('linebot');
const axios = require('axios');
const session = require('express-session');

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
// allow preflight
app.options('*', cors()) 

app.use('/static', express.static(__dirname + '/public'));

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
  console.log('linewebhook req:', req.body.events[0].message)
  bot.parse(req.body);
  return res.json({'send': 'done'});
});

app.post('/line/push', (req, res) => {
  const { msgObject , userIds } = req.body;
  console.log('/line/push:', msgObject, userIds)
  bot.multicast(userIds, msgObject)
    .then(resp=>{
      console.log('line push done:', resp)
      res.json({status: 'done'})
    })
})

//判斷是否為新安員工
app.get('/line/istmnewa/:userId', db.queryIsTmnewa)

//將line userid 對應到tmnewa 帳號
app.post('/line/linktmnewa', db.linkTmnewaAccount)

//取得所有ID
app.get('/line/getAllUserId', db.queryAllLineId)

bot.on('message', function (event) {
  console.log('bot message:',event.message.content().then(resp=>{
    console.log('content()', resp)
  }));
  event.reply(event.message.text).then(function (data) {
    console.log('Success', data);
  }).catch(function (error) {
    console.log('Error', error);
  });
});


app.get('/', (req, res) => {
  //res.json({info: 'hihi'})
  console.log('first request')
  res.json({'text': 'hey you'})
  //next();
});

//取得某userid的第id張圖
app.get('/user/:userId/:id', db.queryImageById);

app.post('/users', db.insertImage);

app.get('/token', (req, res) => {
  res.status(201).json({ 'token:': process.env.BTOKEN })
});

app.post('/tmtoken', (req, res) => {
  let { client, secret } = req.body;
  console.log('/tmtoken:', req.headers)
  let config = {
    url: 'https://abc.com.tw/!carapp/SignIn',
    method: 'post',
    headers: {
      'Authorization': 'Basic ',
      'Content-Type': 'application/json',
    },
    data: {
      //url: 'https://localhost:5001/api/values',
      client: client,
      secret: secret
    }
  };

  axios(config)
    .then(resp => {
      console.log('token:', resp.data.access_token)
      
      res.redirect('307', 'https://abc.com.tw/Car/CAQuotation/Index');
      //res.json({ 'token': resp.data.access_token })
    })
    .catch(err => {
      console.log('nodejs err:', err)
      res.status(400).json(err)
    })


})

app.listen(port, () => {
  console.log('app is working')
});