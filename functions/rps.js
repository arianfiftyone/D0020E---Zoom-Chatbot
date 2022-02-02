const request = require('request')

function rps(chatbotToken, event, commandParamSplitted) {
    hand = Math.floor(Math.random() * 3); //rock == 0, paper == 1, scissor ==2
    if (hand == 0) {
        rps = 'rock'
    }
    else if (hand == 1) {
        rps = 'paper'
    }
    else {
        rps = 'scissor'
    }
    if(commandParamSplitted == 'rock' && rps == 'paper') {
        textToUser = 'Bot chose ' + rps + ', you lost.'
    }
    else if(commandParamSplitted == 'rock' && rps == 'scissor') {
        textToUser = 'Bot chose ' + rps + ', you won!'
    }
    else if(commandParamSplitted == 'paper' && rps == 'rock') {
        textToUser = 'Bot chose ' + rps + ', you won!'
    }
    else if(commandParamSplitted == 'paper' && rps == 'scissor') {
        textToUser = 'Bot chose ' + rps + ', you lost.'
    }
    else if(commandParamSplitted == 'scissor' && rps == 'rock') {
        textToUser = 'Bot chose ' + rps + ', you lost.'
    }
    else if(commandParamSplitted == 'scissor' && rps == 'paper') {
            textToUser = 'Bot chose ' + rps + ', you won!'
    }
    else if (commandParamSplitted == rps) {
        textToUser = 'You tied, both chose ' + rps + '. Play again?'
    }
    else {
      textToUser = 'Please choose rock, paper, or scissor'
    }

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
              'text': 'Rock, paper, scissor'
            },
            'body': [{
              'type': 'message',
              'text': textToUser
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

module.exports = rps