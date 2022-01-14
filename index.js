// installed and imported modules
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
// db const and connection here
// having some major issues with the queries to DB since those parts are rewritten


const {
  oauth2,
  client
} = require('@zoomus/chatbot')
const oauth2Client = oauth2(process.env.client_id, process.env.client_secret)

// the zoomus/chatbot API. not fair, stuff is scuffed.
// sets up chatbot object and adds a help message when user types "/vote help"
let chatbot = client(process.env.client_id, process.env.verification_token, process.env.bot_jid)
  .commands([{
    command: '/' + process.env.slash_command,
    hint: 'Tacos for Lunch?',
    description: 'Vote on topics in Zoom Chat'
  }])
  .configurate({
    help: true,
    errorHelp: false
  }).defaultAuth(oauth2Client.connect())

const app = express()
const port = process.env.PORT || 4000

app.use(bodyParser.json())

// recieves redirect url
app.get('/authorize', async function (req, res) {
  res.send('Thanks for installing the zChatbot for Zoom!')
})

/* Stuff to sort out:
  x. Save 'actions' for '/zchatbot poll <question>' in an array somehow and then output after a timer/#votes?
  y. Should try to store token in PostgreSQL somehow. Shouldnt be a problem, dont see the point rn though.
  z. Should figure out how to split up code, index.js is getting messy and try to get rid of repeating code.
*/

// recieves slash commands and user actions
app.post('/' + process.env.slash_command, async function (req, res) {
  try {
    let {
      body,
      headers
    } = req
    console.log(headers)
    await chatbot.handle({
      body,
      headers
    })

    res.status(200)
    res.send()
  } catch (error) {
    console.log(error)
    res.send(error)
  }


  // SELECT query here?
})

// calls chatbot.on() function below based on what is sent (commands or actions)
chatbot.on('commands', async function (event) {

  // handles auth
  let connection = oauth2Client.connect()
  let app = chatbot.create({
    auth: connection
  })

  // split at first whitespace after /zchatbot, i.e second command is either repeat or poll atm
  let second_command = event.message.split(" ")[0]
  console.log(second_command)


  if (second_command === 'repeat') {

    // get index of first whitespace and split accordingly
    var command_param_index = event.message.indexOf(' ')
    var command_param_splitted = event.payload.cmd.slice(command_param_index)

    console.log('Executing repeat command')
    //console.log(command_param_splitted)

    // app logic here, sending a chatbot with repeated message
    with_chatbot_token(send_repeatmsg)

    // functioncall above needs to be replaced for DB implementation, not sure how to workaround

    // removed app.sendMessage, remember sendMessage turns headers into head
    // every command now has a function that sends a separate 'command' message.
    function send_repeatmsg(chatbotToken) {
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
              'text': 'Repeat command header'
            },
            'body': [{
              'type': 'message',
              'text': 'You sent:' + command_param_splitted
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
  } 
  
  else if (second_command === 'poll') {

    // repeat
    var command_param_index = event.message.indexOf(' ')
    var command_param_splitted = event.payload.cmd.slice(command_param_index)
    console.log('Executing poll command')

    try {

      // app logic here, sending a chatbot message with buttons
      with_chatbot_token(send_pollmsg)
      //console.log(event.message)

      // repeat, create a more general function to pass in arguments that are needed for body/head
      function send_pollmsg(chatbotToken) {
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
                'text': 'Vote poll command header'
              },
              'body': [{
                'type': 'section',
                'sections': [{
                    'type': 'message',
                    'text': command_param_splitted
                  },
                  {
                    'type': 'actions',
                    'items': [{
                        'text': 'Up Vote',
                        'value': 'up-vote',
                        'style': 'Primary'
                      },
                      {
                        'text': 'Down Vote',
                        'value': 'down-vote',
                        'style': 'Danger'
                      }
                    ]
                  }
                ],
                'footer': 'Vote by ' + event.payload.userName
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
    } catch (error) {
      console.log(error)
    }
  }

  // takes a callback function as a parameter 
  function with_chatbot_token(callbackFunction) {
    request({
      url: `https://zoom.us/oauth/token?grant_type=client_credentials`,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(process.env.client_id + ':' + process.env.client_secret).toString('base64')
      }
    }, (error, httpResponse, body) => {
      if (error) {
        console.log('Error getting chatbot_token from Zoom.', error)
      } else {
        body = JSON.parse(body)
        // return workaround
        callbackFunction(body.access_token)
        // UPDATE query here?
      }
    })
  }
  
})

// handles user actions on chatbot messages like editing text and form fields, clicking buttons, and choosing dropdown options
chatbot.on('actions', async function (event) {

  with_chatbot_token(send_poll_action_msg)

  // insert the array here, i guess?
  function send_poll_action_msg(chatbotToken) {
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
            'text': 'Vote bot:' + event.payload.original.body[0].sections[0].text
          },
          'body': [{
            'type': 'message',
            'text': event.payload.userName + ' ' + event.payload.actionItem.text + 'd'
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

  // repeat
  function with_chatbot_token(callbackFunction) {
    request({
      url: `https://zoom.us/oauth/token?grant_type=client_credentials`,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(process.env.client_id + ':' + process.env.client_secret).toString('base64')
      }
    }, (error, httpResponse, body) => {
      if (error) {
        console.log('Error getting chatbot_token from Zoom.', error)
      } else {
        body = JSON.parse(body)
        callbackFunction(body.access_token)
        // UPDATE query here?
      }
    })
  }

})

// Other routes required to publish Chatbot to Zoom App Marketplace (not required if private (your Zoom account only) app)

// required, support page
app.get('/support', (req, res) => {
  res.send('Contact {{ email }} for support.')
})

// required, privacy page
app.get('/privacy', (req, res) => {
  res.send('The zChatbot for Zoom does not store any user data.')
})

// required, domain name validation
app.get('/zoomverify/verifyzoom.html', (req, res) => {
  res.send(process.env.zoom_verification_code)
})

// optional, could be your app web homepage with link to install or pictures of how it works
app.get('/', (req, res) => {
  res.send('Welcome to the zChatbot for Zoom!')
})

// required, uninstall flow
app.post('/deauthorize', (req, res) => {
  if (req.headers.authorization === process.env.verification_token) {
    res.status(200)
    res.send()
    request({
      url: 'https://api.zoom.us/oauth/data/compliance',
      method: 'POST',
      json: true,
      body: {
        'client_id': req.body.payload.client_id,
        'user_id': req.body.payload.user_id,
        'account_id': req.body.payload.account_id,
        'deauthorization_event_received': req.body.payload,
        'compliance_completed': true
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(process.env.client_id + ':' + process.env.client_secret).toString('base64'),
        'cache-control': 'no-cache'
      }
    }, (error, httpResponse, body) => {
      if (error) {
        console.log(error)
      } else {
        console.log(body)
      }
    })
  } else {
    res.send('Unauthorized request to zChatbot for Zoom.')
  }
})

app.listen(port, () => console.log(`zChatbot for Zoom listening on port ${port}!`))
