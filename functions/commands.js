const request = require('request')

function sendCommands(chatbotToken, event, commandParamSplitted) {

  var textToUser='this function is still in development'
  //else, send info about asked command
  //now, we input this for hand but we will look if this can be automated in some way..

  try{
      console.log(commandParamSplitted.search('/'))//debug, remove later
      if(commandParamSplitted.search('/') !== -1){
        
        console.log('WARNING, ATTEMPT OF UNAUTHORIZED FILE ACCESS ATTEMPTED\n')
        throw err
      }
      var fs = require('fs')
      filename = './commandsInfo/' + commandParamSplitted + '.txt'
      fs.readFile(filename, 'utf8', function(err, data) {

        if(err){
          console.log('shit man this no good')
          textToUser="could not find info for " + commandParamSplitted
          makeRequest(chatbotToken, event, textToUser)

        } else {
          console.log('OK: ' + filename)
          textToUser = data
          console.log(textToUser)
          makeRequest(chatbotToken, event, textToUser)
        }
        
      });
      
  } catch(error) {
      textToUser="could not find info for " + commandParamSplitted
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