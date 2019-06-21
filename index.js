const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./query');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const { myLineBot } = require('./linebot');
//const otp = require('./otp');

var corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
}

console.log('cors origin:', corsOptions.origin, corsOptions.origin.length);
const app = express();
app.use(cookieParser())

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}


app.use(cors(corsOptions))
// allow preflight
app.options('*', cors(corsOptions))

//app.use(express.json({limit: '50mb'}));

app.use('/binding', express.static(__dirname + '/public'));

//line webhook
const parser = bodyParser.json({
  verify: function (req, res, buf, encoding) {
    req.rawBody = buf.toString(encoding);
  },
  limit: '50mb'
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
        //console.log('linkMember:', rep);
        myLineBot.push(evt.source.userId, {
          "type": "text",
          "text": `您的帳號已綁定`
        })
      })
    }
  })
  myLineBot.parse(req.body);
  return res.json({ 'send': 'done' });
});

//broadcast message
app.post('/line/push', (req, res) => {
  const { msgObject, userIds } = req.body;
  //console.log('/line/push:', msgObject, userIds)
  myLineBot.multicast(userIds, msgObject)
    .then(resp => {
      //console.log('line push done:', resp)
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
  axios({
    url: `https://api.line.me/v2/bot/message/quota/consumption`,
    method: 'get',
    headers: {
      'Authorization': `Bearer ${process.env.LINE_CHANNELACCESSTOKEN}`,
    }
  }).then((result) => {
    console.log('quota:', result.data);
    res.json({ 'text': 'hey you' })
  }).catch((err) => {
    console.log('quota err:', err);
  })
  //res.json({info: 'hihi'})
  //console.log('first request')
  
  //next();
});

//取得某userid的第id張圖
app.get('/user/:userId/:id', db.linebot.queryImageById);

//upload signature
app.post('/users', db.linebot.insertImage);

//取得product的圖檔
app.get('/productimg/:prodId', db.linebot.queryProductImageById)

app.get('/products', db.linebot.queryProducts);

/* #region TMNEWA  Line Account Link */
//帳號綁定，產生OTP CODE
app.post('/linkTmnewa', db.linebot.genOTPByAccount);

//驗證OTP code
app.post('/verifycode', db.linebot.validateOTP);

//取得已綁定帳號之使用者
app.get('/line/getlinkeduser', db.linebot.queryLinkedUser)

//上傳圖檔
app.post('/tmnewa/uploadimage', db.linebot.insertImage);

//由ID取得tmnewaimages的圖檔
app.get('/tmnewa/getimage/:id', db.linebot.getImageById);
app.get('/tmnewa/getthumbnail/:id', db.linebot.getThumbnailById);


/* #endregion */

app.listen(port, () => {
  console.log('app is working')
});

