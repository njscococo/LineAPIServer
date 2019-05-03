const linebot = require('linebot');

let myLineBot = linebot({
    channelId: process.env.LINE_CHANNELID,
    channelSecret: process.env.LINE_CHANNELSECRET,
    channelAccessToken: process.env.LINE_CHANNELACCESSTOKEN
  });

//console.log('linebot config:', process.env.LINE_CHANNELID)
myLineBot.on('message', evt=>{
    console.log('recieve :', evt)
    var replyMsg = `hihi, you said:${evt.message.text}`;
    evt.reply(replyMsg).then(data=>{
        console.log('send msg done:', data);
    }).catch(err=>{
        console.log('err:', err);
    })
}) 

module.exports = {
    myLineBot
}