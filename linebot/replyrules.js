const dotenv = require('dotenv');
dotenv.config();

const allReplyTextRules = [{
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
        text: '這是台新通路測試'
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
        text: {
            "type": "image",
            "originalContentUrl": `${process.env.BASE_URL}tmnewa/getimage/22`,
            "previewImageUrl": `${process.env.BASE_URL}tmnewa/getthumbnail/22`
        }
    }
}
];


const getRulesByState = function (stateId = "") {
    //console.log('getRulesByState', stateId);
    const tempState = stateId.split('-')[0];
    //console.log('tempState', tempState);
    //const baseState = tempState ===''? -1 : parseInt(tempState, 10);
    return tempState === '' ? allReplyTextRules : allReplyTextRules.filter((ele, idx) => {
        return ele.state ? ele.state.startsWith('1-') : false
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