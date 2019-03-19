const linebot = require('linebot');

// let bot = linebot({
//     channelId: '1556507935',
//     channelSecret: '2f5c22fd501c3ca18df46b44de8c14fd',
//     channelAccessToken: '61Pat0jhwFTkDgHSALfTQKOyqI6cE3B8cIpDUEkK5Z0j/MrqvALSPk9P3VEm8KmENL0zplewcQlTZaoyvpdOaJDXTH+o5uzPGOa6MM7grM6nZzMt6a1iJIfL4b6ro5FIRFScBgFW1txFJ8P2AQi44FGUYhWQfeY8sLGRXgo3xvw='
//   });
let bot = linebot({
    channelId: process.env.LINE_CHANNELID,
    channelSecret: process.env.LINE_CHANNELSECRET,
    channelAccessToken: process.env.LINE_CHANNELACCESSTOKEN
  });

console.log('linebot config:', process.env.LINE_CHANNELID)
bot.on('message', evt=>{
    var replyMsg = `hihi, you said:${evt.message.text}`;
    evt.reply(replyMsg).then(data=>{
        console.log('send msg done:', data);
    }).catch(err=>{
        console.log('err:', err);
    })
})

module.exports = {
    bot
}