const request = require('request')
const stringSimilarity = require('string-similarity')
const commands = ['repeat', 'coinflip', 'poll', 'multipoll', 'weather', 'info']


function commandBestMatch(chatbotToken, event, secondCommand) {

    let matches = stringSimilarity.findBestMatch(secondCommand, commands)
    let output = ""
    if (matches.bestMatch.rating > 0.3) {
        output = "Did you mean: " + matches.bestMatch.target + "?"

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
                        'text': 'Suggested command'
                    },
                    'body': [{
                            'type': 'message',
                            'text': output
                        },
                        {
                            'type': 'actions',
                            'items': [{
                                    'text': 'Yes',
                                    'value': 'yes',
                                    'style': 'Primary'
                                },
                                {
                                    'text': 'No',
                                    'value': 'no',
                                    'style': 'Danger'
                                },
                            ]
                        }
                    ]
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
    else {
        output = "No suggestions for your input!"
    }

    return matches.bestMatch.target
}

module.exports = commandBestMatch