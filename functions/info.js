const request = require('request')

var info = {}


function sendInfo(chatbotToken, event, commandParamSplitted) {
  let commandList = commandParamSplitted.split(' ')
  if(commandList[0] == 'list') {
    const keys = Object.keys(info)
    textToUser = 'You can get information about the following things: ' + keys
  }
  else if (commandList[0] == 'printAll') {
    textToUser = ""
    for (key in info) {
      textToUser += key + ": " + info[key] + "\n"
    }
  }
  else if (commandList[0] === 'add') {
    textToUser = addInfo(commandList)
  }
  else if(commandList[0] === 'remove') {
    textToUser = removeInfo(commandList[1])
  }
  else if (commandList[0] in info){
    textToUser = commandList[0] + ": " + info[commandList[0]]
  }
  else {
    textToUser = "Information not available"
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

function addInfo(commandList) {
  let valueString = ""
  for (let i = 2; i < commandList.length; i++) {
    valueString += commandList[i] +  " "
  }
  info[commandList[1]] = valueString
  textToUser = "Info added!"
  return textToUser
}

function removeInfo(keyToRemove) {
  if (keyToRemove in info) {
      delete info[keyToRemove]
      textToUser = keyToRemove + ' has been removed from the dictionary'
  }
  else {
      textToUser = 'This key does not exist.'
  }
  return textToUser
}
module.exports = sendInfo