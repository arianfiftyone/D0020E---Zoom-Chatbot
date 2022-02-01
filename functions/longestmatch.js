const request = require('request')
const stringSimilarity = require('string-similarity')
const commands = ['repeat', 'coinflip', 'poll', 'multipoll', 'weather', 'info']


function longestMatch(chatbotToken, event, secondCommand) {

    let matches = stringSimilarity.findBestMatch(secondCommand, commands)

    request({
        url: 'https://api.zoom.us/v2/im/chat/messages',
        method: 'POST',
        json: true,
        body: {
        'robot_jid': process.env.bot_jid,
        'to_jid': event.payload.toJid,
        'account_id': event.payload.accountId,
        'content': {
            'head': {
            'text': 'Wrong command?'
            },
            'body': [{
            'type': 'message',
            'text': 'Did you mean: ' + matches.bestMatch.target
            }]
        }
        },
        headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + chatbotToken
        }
    }, (error, httpResponse, body) => {
        if (error) {
        console.log('Error sending chat.', error)
        } else {
        console.log(body)
        }
    })
}

module.exports = longestMatch