const replyTextRules = [{
    keyword: 'yes',
    replyMsgType: 'text',
    msgContent: {
        text: 'good morning'
    }
},{
    keyword: 'no',
    replyMsgType: 'text',
    msgContent: {
        text: 'good night'
    }
}]

module.exports = replyTextRules;