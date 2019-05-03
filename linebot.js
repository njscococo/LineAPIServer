const linebot = require('linebot');
const db = require('./query');
const axios = require('axios');

let myLineBot = linebot({
    channelId: process.env.LINE_CHANNELID,
    channelSecret: process.env.LINE_CHANNELSECRET,
    channelAccessToken: process.env.LINE_CHANNELACCESSTOKEN
  });

myLineBot.on('message', function (event) {
  console.log('bot message:', event.message);
  //event.reply(event.message.text)
  switch (event.message.type) {
    case 'text':
      if (event.message.text === '產品清單') {
        //console.log('event.source.userId', event.source.userId)
        db.linebot.checkDBIsTmnewa(event.source.userId).then(result => {                  
          if (result) {
            axios({
              url: 'https://linetestingserver.herokuapp.com/products',
              method: 'get'
            })
              .then((res) => {
                //console.log('product', res.data)
                let columns = res.data.map((elm, idx) => {
                  return {
                    title: elm.title,
                    text: elm.price,
                    actions: [{
                      "type": "message",
                      "label": "Yes",
                      "text": "Yes"
                    },
                    {
                      "type": "postback",
                      "label": "Buy",
                      "data": "action=buy&itemid=111",
                      "text": "Buy"
                    }
                    ],
                    thumbnailImageUrl: `https://linetestingserver.herokuapp.com/productimg/${elm.id}`
                  }
                })
                event.reply({
                  "type": "template",
                  "altText": "this is a carousel template",
                  "template": {
                    "type": "carousel",
                    "imageAspectRatio": "rectangle",
                    "imageSize": "cover",
                    "columns": columns
                  }
                })
              })
              .catch((err) => {

              })

          }else{
            event.reply('請先綁定帳號')
          }

        })


      }else if(event.message.text === '帳號綁定'){
          db.linebot.queryIsLinked(event.source.userId)
          .then((result) => {
              console.log('id binding:', result)
          })

      } else {
        event.reply(event.message.text)
          .then(function (data) {
            console.log('Success', data);
          }).catch(function (error) {
            console.log('Error', error);
          });
      }

      break;

  }
});

module.exports = {
    myLineBot
}