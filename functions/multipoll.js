const res = require('express/lib/response')
const request = require('request')

function sendMpollMsg(chatbotToken, event, commandParamChoices) {
  let returnBuild = buildMpollItems(commandParamChoices)
  let itemBuild = returnBuild[0]
  let pollCountAlternatives = returnBuild[1]
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
              'items': itemBuild,
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
  return pollCountAlternatives
}

function sendMpollActionMsg(chatbotToken, event, commandParamChoices, pollCountAlternatives) {
  let resultText = buildMpollResults(commandParamChoices, pollCountAlternatives)

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
          'text': resultText
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

// /zchatbot multipoll q?, detta, är, rätt -r, fel

function buildMpollItems(commandParamChoices) {
  let itemBuild = []
  let pollCountAlternatives = {}
  let i
    for (i = 1; i < commandParamChoices.length; i++) {
      itemBuild[i-1] = {
        'text': commandParamChoices[i].replace(" -r", ""),
        'value': commandParamChoices[i],
        'style': ''
      }
      pollCountAlternatives[commandParamChoices[i]] = 0
    }
    itemBuild[i-1] = {
      'text': 'Results',
      'value': "mpoll-results",
      'style': ''
    }
    return [itemBuild, pollCountAlternatives]
}

function buildMpollResults(commandParamChoices, pollCountAlternatives) {
  let resultText = ""
  let correctAnswer
  for (let i = 1; i < commandParamChoices.length; i++) {
    resultText += "Votes on " + commandParamChoices[i].replace(" -r", "") + ": " + pollCountAlternatives[commandParamChoices[i]]
    resultText += '\n'
    if (commandParamChoices[i].includes(" -r")) {
      commandParamChoices[i] = commandParamChoices[i].replace(" -r", "")
      correctAnswer = commandParamChoices[i]
    }
  }

  resultText += 'The correct answer was: ' + correctAnswer

  return resultText
}

module.exports = {
    sendMpollMsg,
    sendMpollActionMsg,
}