const request = require('request')

function sendCommands(chatbotToken, event, commandParamSplitted) {

  textToUser='this function is still in development'
  //else, send info about asked command
  //now, we input this for hand but we will look if this can be automated in some way..

  //getCommandsInfo
  
  if(commandParamSplitted == 'all'){

  }
try{
    console.log(commandParamSplitted.search('/'))
    if(commandParamSplitted.search('/') !== -1){
      
      console.log('aja baja')
      throw err
    }
    var fs = require('fs')
    filename = './commandsInfo/' + commandParamSplitted + '.txt'
    fs.readFile(filename, 'utf8', function(err, data) {
      console.log('OK: ' + filename)
      console.log(data)
    });
} catch(error) {
    textToUser="could not find info for " + commandParamSplitted
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