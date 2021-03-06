const request = require('request')

function getWeatherMessage (chatbotToken, event, commandParamSplitted) {
    let city = commandParamSplitted
    var message = ""
    request(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.openweather_accesskey}`, function(error, response, body) {
      if (response.statusCode === 200) {
          let data = JSON.parse(body)
          message = "The weather description in " + city + " is: " + data.list[0].weather[0].description + 
          " \n" + "Temperature: " + Math.round(data.list[0].main.temp - 273.15) + " celsius \nThe wind speed is: " + data.list[0].wind.speed + " m/s"
          sendWeatherRequest(chatbotToken, event, message)
      }
    })
}

function sendWeatherRequest(chatbotToken, event, message) {
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
              'text': 'Weather'
            },
            'body': [{
              'type': 'message',
              'text': message
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

module.exports = getWeatherMessage