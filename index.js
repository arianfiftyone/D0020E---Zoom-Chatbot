// installed and imported modules
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const repeatFunction = require('./functions/repeat.js')
const pollFunction = require('./functions/poll.js')
const multipollFunction = require('./functions/multipoll.js')

// Gigaomega object
const {
  oauth2,
  client
} = require('@zoomus/chatbot')
const oauth2Client = oauth2(process.env.client_id, process.env.client_secret)

// Sets up chatbot object and adds a help message when user types "/vote help"
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

})

// variables
let up_vote
let down_vote
var pollResultsDisplayed
var mpollResultsDisplayed
var commandParamChoices

// calls chatbot.on() function below based on what is sent (commands or actions)
chatbot.on('commands', async function (event) {

  // handles auth
  let connection = oauth2Client.connect()
  let app = chatbot.create({
    auth: connection
  })

  // split at first whitespace after /zchatbot, i.e second command is either repeat or poll atm
  let secondCommand = event.message.split(" ")[0]
  var commandParamIndex = event.message.indexOf(' ')
  var commandParamSplitted = event.payload.cmd.slice(commandParamIndex)

  if (secondCommand === 'repeat') {

    withChatbotToken(repeatFunction)

  } 
  
  else if (secondCommand === 'poll') {

    up_vote = 0
    down_vote = 0
    pollResultsDisplayed = true

    try {
      withChatbotToken(pollFunction.sendPollMsg)
    } catch (error) {
      console.log(error)
    }
  }

  else if (secondCommand === 'multipoll') {

    a_vote = 0
    b_vote = 0
    c_vote = 0
    d_vote = 0
    mpollResultsDisplayed = true

    commandParamChoices = commandParamSplitted.split(', ')
    
    try {
      withChatbotToken(multipollFunction.sendMpollMsg)
    } catch (error) {
      console.log(error)
    }
  }

  // takes a callback function as a parameter 
  function withChatbotToken(callbackFunction) {
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
        if (secondCommand === 'poll' || secondCommand === 'repeat') {
          callbackFunction(body.access_token, event, commandParamSplitted)
        }
        else if (secondCommand === 'multipoll') {
          callbackFunction(body.access_token, event, commandParamChoices)
        }
      }
    })
  }

})


// handles user actions on chatbot messages like editing text and form fields, clicking buttons, and choosing dropdown options
chatbot.on('actions', async function (event) {

  if(event.payload.actionItem.value === "poll-results" && pollResultsDisplayed) {
    pollResultsDisplayed = false
    withChatbotToken(pollFunction.sendPollActionMsg)
  }
  else if (event.payload.actionItem.value === "mpoll-results" && mpollResultsDisplayed) {
    mpollResultsDisplayed = false
    withChatbotToken(multipollFunction.sendMpollActionMsg)
  }
  // count the votes
  else if (event.payload.actionItem.value === 'up-vote')
  {
    up_vote += 1
  }
  else if (event.payload.actionItem.value === 'down-vote')
  {
    down_vote += 1
  }
  // count the alternatives
  else if (event.payload.actionItem.value === 'a-vote') {
    a_vote += 1
  }
  else if (event.payload.actionItem.value === 'b-vote') {
    b_vote += 1
  }
  else if (event.payload.actionItem.value === 'c-vote') {
    c_vote += 1
  }
  else if (event.payload.actionItem.value === 'd-vote') {
    d_vote += 1
  }
  
  console.log('Up Vote: ' + up_vote)
  console.log('Down Vote: ' + down_vote)
  console.log('Votes on ' + commandParamChoices[1] + ': ' + a_vote)
  console.log('Votes on ' + commandParamChoices[2] + ': ' + b_vote)
  console.log('Votes on ' + commandParamChoices[3] + ': ' + c_vote)
  console.log('Votes on ' + commandParamChoices[4] + ': ' + d_vote)

  // repeat
  function withChatbotToken(callbackFunction) {
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
        if (event.payload.actionItem.value === "poll-results") {
          callbackFunction(body.access_token, event, up_vote, down_vote)
        }
        else if (event.payload.actionItem.value === "mpoll-results") {
          callbackFunction(body.access_token, event, commandParamChoices, a_vote, b_vote, c_vote, d_vote)
        }
      }
    })
  }

})

// Other routes required to publish Chatbot to Zoom App Marketplace (not required if private (your Zoom account only) app)
// support page required for marketplace
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
        'Authorization': 'Basic ' + Buffer.from(process.env.zoom_client_id + ':' + process.env.zoom_client_secret).toString('base64'),
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