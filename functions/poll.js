const request = require('request')

function sendPollMsg(chatbotToken, event, command_param_splitted) {
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
          'text': 'Vote poll command header'
        },
        'body': [{
          'type': 'section',
          'sections': [{
              'type': 'message',
              'text': command_param_splitted
            },
            {
              'type': 'actions',
              'items': [{
                  'text': 'Up Vote',
                  'value': 'up-vote',
                  'style': 'Primary'
                },
                {
                  'text': 'Down Vote',
                  'value': 'down-vote',
                  'style': 'Danger'
                },
                {
                  'text': 'Results',
                  'value': 'poll-results',
                  'style': 'Default'
                }
              ]
            }
          ],
          'footer': 'Poll created by ' + event.payload.userName
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


function sendPollActionMsg(chatbotToken, event, up_vote, down_vote) {
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
          'text': 'Results for poll: ' + event.payload.original.body[0].sections[0].text
        },
        'body': [{
          'type': 'message',
          'text': 'Up Votes: ' + up_vote + '\n' + 'Down Votes: ' + down_vote
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



module.exports = {
    sendPollMsg,
    sendPollActionMsg
}