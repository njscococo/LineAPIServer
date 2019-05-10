const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./query');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const { myLineBot } = require('./linebot');

var corsOptions = {
  origin: ['https://linetestingserver.herokuapp.com', 'http://localhost:3000', 'https://linemsgplatform.herokuapp.com'],
  credentials: true
}

const app = express();
app.use(cookieParser())

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
//console.log('port:', port)
//email();
app.use(cors(corsOptions))
// allow preflight
app.options('*', cors(corsOptions))

app.use('/binding', express.static(__dirname + '/public'));

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
  req.body.events.forEach((evt, idx) => {
    if (evt.type === 'accountLink') {
      db.linebot.linkMember(evt.source.userId, evt.link.nonce).then((rep) => {
        console.log('linkMember:', rep);
      })
    }
  })
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
  //console.log('first request')
  res.json({ 'text': 'hey you' })
  //next();
});

//取得某userid的第id張圖
app.get('/user/:userId/:id', db.linebot.queryImageById);

//upload signature
app.post('/users', db.linebot.insertImage);

//取得product的圖檔
app.get('/productimg/:prodId', db.linebot.queryProductImageById)

// app.get('/token', (req, res) => {
//   res.status(201).json({ 'token:': process.env.BTOKEN })
// });

// app.post('/tmtoken', (req, res) => {
//   let { client, secret } = req.body;
//   console.log('/tmtoken:', req.headers)
//   let config = {
//     url: 'https://abc.com.tw/!carapp/SignIn',
//     method: 'post',
//     headers: {
//       'Authorization': 'Basic ',
//       'Content-Type': 'application/json',
//     },
//     data: {
//       //url: 'https://localhost:5001/api/values',
//       client: client,
//       secret: secret
//     }
//   };

//   axios(config)
//     .then(resp => {
//       console.log('token:', resp.data.access_token)

//       res.redirect('307', 'https://abc.com.tw/Car/CAQuotation/Index');
//       //res.json({ 'token': resp.data.access_token })
//     })
//     .catch(err => {
//       console.log('nodejs err:', err)
//       res.status(400).json(err)
//     })


// })

app.get('/products', db.linebot.queryProducts);

/* #region  Line Account Link */
//帳號綁定，產生OTP CODE
app.post('/linkTmnewa', db.linebot.genOTPByAccount);

//驗證OTP code
app.post('/verifycode', db.linebot.validateOTP);

//取得已綁定帳號之使用者
app.get('/line/getlinkeduser', db.linebot.queryLinkedUser)

app.post('/uploadimage', db.linebot.insertImage);
/* #endregion */

app.listen(port, () => {
  console.log('app is working')
});

