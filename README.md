# A chatbot for Zoom


The use of this app is a subject to [Zooms Terms of Use](https://explore.zoom.us/docs/en-us/zoom_api_license_and_tou.html).

This is a schoolproject in the course 'D0020E - Projekt i Datateknik' using the [Zoom Chatbot NPM Package](https://www.npmjs.com/package/@zoomus/chatbot)

![Chatbot for Zoom]()

## Prerequisites
1. [A free Zoom account](https://marketplace.zoom.us/)
2. [Ngrok.io](https://ngrok.com/)
3. [Node.js](https://nodejs.org/en/)
4. [A free Openweathermap account](https://openweathermap.org)
5. .
6. .
7. .
8. 


To run the completed Chatbot code locally, continue reading below.

### Local/Development Setup

To run the completed Chatbot locally, follow these steps,

1. In terminal:

   `$ git clone https://github.com/arianfiftyone/D0020E---Zoom-Chatbot`

   `$ cd D0020E---Zoom-Chatbot`

   `$ npm install request express body-parser dotenv --save`

   `$ touch .env`
   
2. Add this code to your .env file

   `client_id=Required` Your Zoom **Development Client ID**, found in your Zoom app's **App credentials** tab. <br />
   `client_secret=Required` Your Zoom **Development Client Secret**, found in your Zoom app's **App credentials** tab. <br />
   `verification_token=Required` The Zoom **Verification Token**, found in your Zoom app's **Feature** tab. <br />
   `bot_jid=Required` Your Zoom **Development Bot JID**, found in your Zoom app's **Feature** tab. <br />
   `slash_command=Required` Your Zoom **Slash command**, found in your Zoom app's **Feature** tab. <br />
   `openweather_accesskey=Required` Your Openweather **Access Key**, found on Openweather.org > Account > API keys. <br />
   
3. In terminal:

   `$ npm run start` or `$ nodemon` ([for live reload / file change detection](https://www.npmjs.com/package/nodemon))

   `$ ngrok http 4000` ([ngrok turns localhost into live server](https://ngrok.com/) so slash commands and user actions can be sent to your app)
   
4. Open your ngrok https url in a browser, you should see this,

   `'Welcome to the "your slash_command" for Zoom!'`
  
5. On your App Marketplace Dashboard, add your ngrok https url to your Whitelist URLs (App Credentials Page), **Development** Redirect URL for OAuth (App Credentials Page), and **Development** Bot Endpoint URL (Features Page). Make sure to match the path after your ngrok https url with the express routes in index.js.

   > In order to click the **Save** button on the Features page when adding a Slash Command and Development Bot Endpoint URL, you have to provide a Production Bot Endpoint URL.    Feel free to use https://zoom.us as a placeholder.

   After that, your app is ready to be installed!
   
 7. On your App Marketplace Dashboard, go to the **Local Test** page and click **Install**. After you click the **Authorize** button, you should be taken to your redirect url and see this,
   
   `Thanks for installing the "your slash_command" for Zoom!`
    
 8. Now that your Chatbot is installed on your Zoom account, go to a Zoom Chat channel and type,

   `/"your slash_command" poll Pizza for lunch?`


