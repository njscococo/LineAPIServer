const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./query');
const linebot = require('linebot');
const axios = require('axios');

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

app.post('/line/push', (req, res) => {
  const { msg } = req.body;
  console.log('/line/push:', msg)
  bot.push('U276656692ad7af2fa0ada7e69f286165',
    {
      "type": "text",
      "text": msg
    })
})

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

app.get('/token', (req, res) => {
  res.status(201).json({ 'token:': process.env.BTOKEN })
});

app.post('/tmtoken', (req, res) => {
  let { client, secret } = req.body;
  console.log('/tmtoken:', req.body)
  let config = {
    //url: 'https://ebptest.tmnewa.com.tw/!carapp/Partner/App/SignIn',
    url: 'https://ebp.tmnewa.com.tw/Partner/App/SignIn',
    method: 'post',
    //baseURL: 'https://ebp.tmnewa.com.tw/',
    headers: {
      'Authorization': 'Basic VE1OZXdhOlRNTmV3YUFwcA==',
      'Content-Type': 'application/json',
      //'Host': 'ebp.tmnewa.com.tw'
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
      // return axios({
      //   url: 'https://ebp.tmnewa.com.tw/Car/CAQuotation/Index',
      //   method: 'get',
      //   headers: {
      //     'Authorization': 'Bearer ' + resp.data.access_token
      //   }
      // })
      res.header('Authorization', 'Bearer ' + resp.data.access_token);
      res.redirect('https://ebp.tmnewa.com.tw/Car/CAQuotation/Index');
      //res.json({ 'token': resp.data.access_token })
    })
    // .then(resp=>{
    //   console.log('tmnewa car:', resp.data)
    //   res.send(resp.data)
    // })
    .catch(err => {
      console.log('tmnewa err:', err)
      res.status(400).json(err)
    })


})

app.listen(port, () => {
  console.log('app is working')
});