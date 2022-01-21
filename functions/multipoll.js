const request = require('request')

function sendMpollMsg(chatbotToken, event, commandParamChoices) {
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
            'text': 'Vote multipoll command header'
          },
          'body': [{
            'type': 'section',
            'sections': [{
                'type': 'message',
                'text': commandParamChoices[0]
              },
              {
                'type': 'actions',
                'items': [{
                    'text': commandParamChoices[1],
                    'value': 'a-vote',
                    'style': 'Primary'
                  },
                  {
                    'text': commandParamChoices[2],
                    'value': 'b-vote',
                    'style': 'Danger'
                  },
                  {
                    'text': commandParamChoices[3],
                    'value': 'c-vote',
                    'style': ''
                  },
                  {
                    'text': commandParamChoices[4],
                    'value': 'd-vote',
                    'style': 'Primary'
                  },
                  {
                    'text': 'Results',
                    'value': 'mpoll-results',
                    'style': ''
                  }
                ]
              }
            ],
            'footer': 'Multipoll created by ' + event.payload.userName
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

function sendMpollActionMsg(chatbotToken, event, commandParamChoices, a_vote, b_vote, c_vote, d_vote) {
    
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
          'text': 'Results for multipoll: ' + event.payload.original.body[0].sections[0].text
          },
          'body': [{
          'type': 'message',
          'text': 'Votes on ' + commandParamChoices[1] + ': ' + a_vote + 
                  '\n' + 'Votes on ' + commandParamChoices[2] + ': ' + b_vote + 
                  '\n' + 'Votes on ' + commandParamChoices[3] + ': ' + c_vote + 
                  '\n' + 'Votes on ' + commandParamChoices[4] + ': ' + d_vote
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
    sendMpollMsg,
    sendMpollActionMsg
}