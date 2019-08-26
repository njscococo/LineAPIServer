const dotenv = require('dotenv');
dotenv.config();

const allReplyTextRules = [
    {
        keyword: '新年快樂',
        //state: '1-3',
        replyMsgType: 'text',
        msgContent: {
            text: [
                {
                "type": "image",
                "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/24`,
                "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/24`
                }, { 
                    "type": "image",
                "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/25`,
                "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/25`
                }
            ]
        }
    },
    {
        keyword: 'yes',
        replyMsgType: 'text',
        msgContent: {
            text: 'good morning'
        }
    }, {
        keyword: 'no',
        replyMsgType: 'text',
        msgContent: {
            text: 'good night'
        }
    }, {
        keyword: '查保經代通路',
        state: '1',
        replyMsgType: 'text',
        msgContent: {
            text: '請輸入保經代碼路代碼(例如：兆豐, 台新, 彰銀)：'
        }
    }, {
        keyword: '兆豐',
        state: '1-1',
        replyMsgType: 'text',
        msgContent: {
            text: '這是兆豐通路測試'
        }
    }, {
        keyword: '台新',
        state: '1-2',
        replyMsgType: 'text',
        msgContent: {
            //text: '這是台新通路測試'
            text: [
                { type: 'text', text: 'Hello, world 1' },
                { type: 'text', text: 'Hello, world 2' }
            ]
        }
    }, {
        keyword: '台新-2',
        state: '1-2-1',
        replyMsgType: 'text',
        msgContent: {
            text: '這是台新2通路測試'
        }
    }, {
        keyword: '彰銀',
        state: '1-3',
        replyMsgType: 'text',
        msgContent: {
            text: [{
                "type": "image",
                "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/148`,
                "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/148`
            }, 
            ]
        }
    },
    {
        keyword: '查DM',
        state: '2',
        replyMsgType: 'text',
        msgContent: {
            text: [
             { type: 'text', text: '請輸入欲查詢之險種名稱。如：住火、商火' }
            //     , { type: 'text', text: 'Hello, world 2' }
            //     , { type: 'text', text: 'Hello, world 3' }
            //     , { type: 'text', text: 'Hello, world 4' }
            ]
        }
    },
    {
        keyword: '住火',
        state: '2-1',
        replyMsgType: 'text',
        msgContent: {
            text: [
             { type: 'text', text: '這是住火DM' }
            //     , { type: 'text', text: 'Hello, world 2' }
            //     , { type: 'text', text: 'Hello, world 3' }
            //     , { type: 'text', text: 'Hello, world 4' }
            ]
        }
    },
    {
        keyword: '商火',
        state: '2-2',
        replyMsgType: 'text',
        msgContent: {
            text: [
             { type: 'text', text: '這是商火DM' }
            //     , { type: 'text', text: 'Hello, world 2' }
            //     , { type: 'text', text: 'Hello, world 3' }
            //     , { type: 'text', text: 'Hello, world 4' }
            ]
        }
    }
];


const getRulesByState = function (stateId = "") {
    //console.log('getRulesByState: ', stateId);
    const tempState = stateId.split('-')[0];
    //console.log('tempState:', tempState);
    let reg = new RegExp(`^${stateId}-[\\d]+$`);
    
    //const baseState = tempState ===''? -1 : parseInt(tempState, 10);
    return tempState === '' ? allReplyTextRules : allReplyTextRules.filter((ele, idx) => {
        //return ele.state ? ele.state.startsWith(`${tempState}-`) : false
        return ele.state ? reg.test(ele.state) : false
    });

}

//取得一階互動規則 => 沒有state或state為1層的
const getLevelOneRule = function () {
    return allReplyTextRules.filter((ele, idx) => (!ele.state || ele.state.split('-').length < 2))
}

//取得下一階互動規則
const getNextLVRule = function (stateId) {
    return allReplyTextRules.filter((ele, idx) => {
        return ele.state ? ele.state.startsWith(`${stateId}-`) : false;
    })
}



module.exports = {
    allReplyTextRules: allReplyTextRules,
    getRulesByState: getRulesByState,
    getLevelOneRule: getLevelOneRule,
    getNextLVRule: getNextLVRule

};