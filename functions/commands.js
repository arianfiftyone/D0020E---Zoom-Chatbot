const request = require('request')
var fs = require('fs')

function sendCommands(chatbotToken, event, commandParamSplitted) {

  var textToUser = 'This function is still in development.'

  try{
      if(commandParamSplitted.search('/') !== -1){
        console.log('WARNING, ATTEMPT OF UNAUTHORIZED FILE ACCESS ATTEMPTED\n')
        throw err
      }
      
      filename = './commandsInfo/' + commandParamSplitted + '.txt'
      fs.readFile(filename, 'utf8', function(err, data) {

        if(err){
          textToUser="Could not find info for " + commandParamSplitted
          makeRequest(chatbotToken, event, textToUser)

        } else {
          console.log('OK: ' + filename)
          textToUser = data
          if(commandParamSplitted === 'all'){
            textToUser = 'Available commands: \n' + textToUser
          }
          console.log(textToUser)
          makeRequest(chatbotToken, event, textToUser)
        }
        
      });
      
  } catch(error) {
      textToUser="Could not find info for " + commandParamSplitted
      makeRequest(chatbotToken, event, textToUser)
  }
}

function makeRequest(chatbotToken, event, textToUser){
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
          'text': 'Info'
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

module.exports = sendCommands