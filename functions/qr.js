const request = require('request')

function qr(chatbotToken, event, commandParamSplitted) {
  request(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${commandParamSplitted}`, (error, body) => {
        var test = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${commandParamSplitted}`
        var QRcode = [
          {
            'type': 'section',
            'sidebar_color': '#D72638',
            'sections': [
              {
                'type': 'attachments',
                'img_url': test,
                'resource_url': 'https://goqr.me/api/doc/create-qr-code/',
                'information': {
                  'title': {
                    'text': 'Follow QR-code for course survey'

                  },
                }
              }
            ]
          }
        ]
        console.log(QRcode)
      sendChat(chatbotToken, event, QRcode)
    })
}

function sendChat (chatbotToken, event, QRcode) {
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
          'text': 'Generated QR code: '
        },
        'body': QRcode
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

module.exports = qr