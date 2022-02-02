const rp = require('request-promise')
const request = require('request')
const cheerio = require('cheerio')

var kronoxUrl
var tentaInfo = ""
var tentaDate = ""

function sendTenta(commandParamSplitted, chatbotToken, event) {
    var hittaTentaUrl = 'https://tenta.ltu.se/ajax/ajax_autocompleteResurser.jsp?typ=kurs&term='
    kronoxUrl = "https://schema.ltu.se/setup/jsp/Schema.jsp?startDatum=idag&intervallTyp=m&intervallAntal=12&sprak=SV&sokMedAND=true&forklaringar=true&resurser=k."
    hittaTentaUrl += commandParamSplitted
    rp(hittaTentaUrl).then(function(html) {
        html = JSON.parse(html)
        kronoxUrl += html[0].value
        hittaDatum(event, chatbotToken)
    })
    .catch(function(err) {
        console.log(err)
    })
}


function hittaDatum(event, chatbotToken) {
    rp(kronoxUrl).then(function(html) {
        const $ = cheerio.load(html)
        const tentaDayClass = $('.data-white td')
        const tentaDateTag = $('b')


        tentaDateTag.each((i, el) => {
          if (i > 0) {
            tentaDate = $(el).text()
          }
          if (i == 1) {
            return false
          }
        })


        tentaDayClass.each((i, el) => {
            if (i > 1) {
                tentaInfo = $(el).text()
            }
            if (i == 2) {
                sendRequest(event, chatbotToken)
                return false
            }
        })

      
    })
    .catch(function(err) {
        console.log(err)
    })
}

function sendRequest(event, chatbotToken) {
  tentaInfo = tentaInfo + ': ' + tentaDate
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
              'text': 'Tentainfo:'
            },
            'body': [{
              'type': 'message',
              'text': tentaInfo
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

module.exports = sendTenta