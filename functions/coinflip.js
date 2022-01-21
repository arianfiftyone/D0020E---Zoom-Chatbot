const request = require('request')

function coinflip(chatbotToken, event, commandParamSplitted) {

    coin = Math.floor(Math.random() * 2); //heads == 1, tails == 0
    if(coin == 1){
        headsOrTails = 'heads'
    } else {
        headsOrTails = 'tails'
    }

    if(commandParamSplitted !== 'heads' && commandParamSplitted  !== 'tails'){
      console.log("Command för COINFLIP: " + commandParamSplitted)
      textToUser = 'please pick [heads] or [tails] (ex: coinflip heads)'
    } else {
      textToUser = 'you picked: ' + commandParamSplitted + '\nthe result was: ' + headsOrTails + '\n'
        
      if(headsOrTails === commandParamSplitted){
        textToUser = textToUser + 'YOU WIN!'
      } else {
        textToUser = textToUser + 'you lost.'
      }
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
              'text': 'Coinflip'
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

module.exports = coinflip