const linebot = require('linebot');
const db = require('./query');
const {allReplyTextRules, getRulesByState, getLevelOneRule, getNextLVRule} = require('./linebot/replyrules');
const { userStates, getUserState, deleteUserState} = require('./linebot/userStates')
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

//let userStates = [];
// 可自訂回覆訊息的規則
// myLineBot.on('message', function (event) {
//     //console.log('newbot message:', event.message);
//     //event.reply(event.message.text)
//     switch (event.message.type) {
//         case 'text':
//             //收到訊息先判斷該USER是否已存在某種狀態，如果是找出對應狀態之訊息種類
//             let userState = getUserState(event.source.userId);
//             console.log('userState', userState);
//             if(userState.state){
//                 //let stateRules = getRulesByState(userState.state);
//                 //console.log('state rules:', stateRules);
//                 getRulesByState(userState.state).forEach((ele) => {
//                     if(event.message.text === ele.keyword){
//                         userState.state = getNextLVRule(ele.state).length===0 ? undefined: ele.state
                        
//                         //userState.state = ele.state;
//                         event.reply(ele.msgContent.text);


//                         console.log('level NEXT state:', getNextLVRule(ele.state));
//                     }
//                 })

//             }else{
//                 //console.log('getLevelOneRule', getLevelOneRule());
//                 getLevelOneRule().forEach((ele, idx) => {
//                     //console.log('stateid', getRulesByState(ele.state)); 
//                     if(event.message.text === ele.keyword){
                        
//                         userState.state = ele.state
//                         event.reply(ele.msgContent.text)

//                         console.log('level 1 state:', userState, userStates);
//                     }
//                 });
//             }
//             break;
//     }
// });

myLineBot.on('message', function (event) {
    console.log('bot message:', event.message);
    //event.reply(event.message.text)
    switch (event.message.type) {
        case 'text':
            allReplyTextRules.forEach((ele, idx) => {
                if(event.message.text === ele.keyword){
                    if (!userStates[event.source.userId]) {
                        //console.log('add user');
                        userStates[event.source.userId] = {};
                        userStates[event.source.userId].userId = event.source.userId;
                        userStates[event.source.userId].state = ele.state;
                    } else {
                        //console.log('get user', userStates[event.source.userId])
                        userStates[event.source.userId].state = 1;
                    }
                    event.reply(ele.msgContent.text)
                }
            })
            if (event.message.text === '查詢通路流程') {
                //console.log('event.source.userId', event.source.userId)

                // db.linebot.queryIsLinked(event.source.userId).then(result => {
                //     if (result) {
                let columns = [{
                    "imageUrl": 'https://images.unsplash.com/photo-1561067039-ba57afb43541?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2734&q=80',
                    //"imageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/22`,
                    "action": {
                        "type": "postback",
                        "label": "彰銀通路流程",
                        "data": "action=buy&itemid=111"
                    }
                }, {
                    "imageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/23`,
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
            }
            else if (event.message.text === '查詢通路流程2') {
                if (!userStates[event.source.userId]) {
                    //console.log('add user');
                    userStates[event.source.userId] = {};
                    userStates[event.source.userId].userId = event.source.userId;
                    userStates[event.source.userId].state = 1;
                } else {
                    //console.log('get user', userStates[event.source.userId])
                    userStates[event.source.userId].state = 1;
                }
                console.log('查詢通路流程22', userStates);
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
                console.log('查詢通路流程21', userStates);
                if (userStates[event.source.userId] && userStates[event.source.userId].state === 1) {
                    console.log('查詢通路流程23', userStates);
                    switch (event.message.text) {
                        case '彰銀':
                            console.log('查詢通路流程31', event.message.text);
                            event.reply({
                                "type": "image",
                                "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/22`,
                                "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/22`
                            });

                            userStates[event.source.userId].state = 0;
                            break;
                        case '匯豐':
                                console.log('查詢通路流程32', event.message.text);
                            event.reply({
                                "type": "image",
                                "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/23`,
                                "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/23`
                            });
                            userStates[event.source.userId].state = 0;
                            break;
                        default:
                            event.reply(event.message.text);
                    }
                } else {
                    event.reply(event.message.text)
                        .then(function (data) {
                            console.log('Success', data);
                        }).catch(function (error) {
                            console.log('Error', error);
                        });
                }
            }
            break;


    }
});


module.exports = {
    myLineBot
}