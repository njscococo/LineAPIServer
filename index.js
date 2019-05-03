const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./query');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const {myLineBot } = require('./linebot');

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
console.log('port:', port)
 
app.use(cors())
// allow preflight
app.options('*', cors())

app.use('/www', express.static(__dirname +'/public'));

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

//line webhook
app.post('/linewebhook', parser, function (req, res) {
  if (!myLineBot.verify(req.rawBody, req.get('X-Line-Signature'))) {
    return res.sendStatus(400);
  }

  console.log('linewebhook req:', req.body.events)
  console.log('linewebhook req msg:', req.body.events[0].message)
  myLineBot.parse(req.body);
  return res.json({ 'send': 'done' });
});

//broadcast message
app.post('/line/push', (req, res) => {
  const { msgObject, userIds } = req.body;
  console.log('/line/push:', msgObject, userIds)
  myLineBot.multicast(userIds, msgObject)
    .then(resp => {
      console.log('line push done:', resp)
      res.json({ status: 'done' })
    })
})

//判斷是否為新安員工
app.get('/line/istmnewa/:userId', db.linebot.queryIsTmnewa)

//將line userid 對應到tmnewa 帳號
app.post('/line/linktmnewa', db.linebot.linkTmnewaAccount)

//取得所有ID
app.get('/line/getAllUserId', db.linebot.queryAllLineId)

app.get('/', (req, res) => {
  //res.json({info: 'hihi'})
  console.log('first request')
  res.json({ 'text': 'hey you' })
  //next();
});

//取得某userid的第id張圖
app.get('/user/:userId/:id', db.linebot.queryImageById);

//upload signature
app.post('/users', db.linebot.insertImage);

//取得product的圖檔
app.get('/productimg/:prodId', db.linebot.queryProductImageById)

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

app.get('/products', db.linebot.queryProducts);

app.listen(port, () => {
  console.log('app is working')
});

// db.checkDBIsTmnewa('U276656692ad7af2fa0ada7e69f286165').then((res) => {
//   console.log('checkDBIsTmnewa', res)
//   console.log('done')
// });

