const linebot = require('linebot');
const db = require('./query');
const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');

const axiosInstance = axios.create({
    baseURL: process.env.BASE_URL
})
console.log('baseurl', process.env.BASE_URL);

let myLineBot = linebot({
    channelId: process.env.LINE_CHANNELID,
    channelSecret: process.env.LINE_CHANNELSECRET,
    channelAccessToken: process.env.LINE_CHANNELACCESSTOKEN
});

let allUsers = [];

myLineBot.on('message', function (event) {
    console.log('bot message:', event.message);
    //event.reply(event.message.text)
    switch (event.message.type) {
        case 'text':
            if (event.message.text === '查詢通路流程') {
                console.log('event.source.userId', event.source.userId)

                // db.linebot.queryIsLinked(event.source.userId).then(result => {
                //     if (result) {
                let columns = [{
                    "imageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/22`,
                    "action": {
                        "type": "postback",
                        "label": "彰銀通路流程",
                        "data": "action=buy&itemid=111"
                    }
                }, {
                    "imageUrl": `${process.env.BASE_URL}tmnewa/getimage/23`,
                    "action": {
                        "type": "postback",
                        "label": "匯豐通路流程",
                        "data": "action=buy&itemid=111"
                    }
                }];

                event.reply({
                    "type": "template",
                    "altText": "通路流程查詢",
                    "template": {
                        "type": "image_carousel",

                        "columns": columns
                    }
                })
                // axiosInstance({
                //     url: 'products',
                //     method: 'get'
                // }).then((res) => {
                //     //console.log('product', res.data)
                //     let columns = res.data.map((elm, idx) => {
                //         return {
                //             title: elm.title,
                //             text: elm.price,
                //             actions: [{
                //                 "type": "message",
                //                 "label": "Yes",
                //                 "text": "Yes"
                //             },
                //             {
                //                 "type": "postback",
                //                 "label": "Buy",
                //                 "data": "action=buy&itemid=111",
                //                 "text": "Buy"
                //             }
                //             ],
                //             thumbnailImageUrl: `${process.env.BASE_URL}productimg/${elm.id}`
                //         }
                //     })
                //     event.reply({
                //         "type": "template",
                //         "altText": "this is a carousel template",
                //         "template": {
                //             "type": "carousel",
                //             "imageAspectRatio": "rectangle",
                //             "imageSize": "cover",
                //             "columns": columns
                //         }
                //     })
                // }).catch((err) => {

                // })

                //     } else {
                //         event.reply('請先綁定帳號')
                //     }
                // })
            } else if (event.message.text === '查詢通路流程2') {
                if (!allUsers[event.source.userId]) {
                    allUsers[event.source.userId] = {};
                    allUsers[event.source.userId].userId = event.source.userId;
                    allUsers[event.source.userId].step = 1;
                }
                event.reply('請輸入欲查詢通路別，ex：彰銀')
            }
            else if (event.message.text === '帳號綁定') {
                db.linebot.queryIsLinked(event.source.userId)
                    .then((result) => {
                        //console.log('id binding:', result)
                        if (result[0]) {
                            //已經綁定過囉
                            event.reply({
                                "type": "text",
                                "text": `${result[0].name} 您好，您的帳號已綁定`
                            })
                        } else {
                            axios({
                                url: `https://api.line.me/v2/bot/user/${event.source.userId}/linkToken`,
                                method: 'post',
                                headers: {
                                    'Authorization': `Bearer ${process.env.LINE_CHANNELACCESSTOKEN}`,
                                }
                            }
                            ).then((result) => {
                                //取得linkToken
                                //console.log('token:', result.data.linkToken)
                                event.reply({
                                    "type": "template",
                                    "altText": "Account Link",
                                    "template": {
                                        "type": "buttons",
                                        "text": "點擊進行帳號綁定",
                                        "actions": [{
                                            "type": "uri",
                                            "label": "帳號綁定",
                                            //"uri":'https://www.tmnewa.com.tw'
                                            //"uri": `https://linetestingserver.herokuapp.com/binding/tmnewalogin.html?linkToken=${result.data.linkToken}`
                                            "uri": `${process.env.BASE_URL}binding/tmnewalogin.html?linkToken=${result.data.linkToken}`
                                        }]
                                    }
                                })
                            })

                        }
                    })

            } else if (event.message.text === '新年快樂') {
                event.reply([{
                    "type": "image",
                    "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/24`,
                    "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/24`
                }, {
                    "type": "image",
                    "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/25`,
                    "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/25`
                }]);

            }
            else {
                if (allUsers[event.source.userId] && allUsers[event.source.userId].step === 1) {
                    switch (event.message.text) {
                        case '彰銀':
                            event.reply({
                                "type": "image",
                                "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/22`,
                                "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/22`
                            });
                            allUsers[event.source.userId].step = 0;
                            break;
                        case '匯豐':
                                event.reply({
                                    "type": "image",
                                    "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/23`,
                                    "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/23`
                                });
                            allUsers[event.source.userId].step = 0;
                            break;
                    }
                }
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