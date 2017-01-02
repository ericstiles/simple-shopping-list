# Node Shopping List  App

A Node app built with MongoDB, Express and Angular. For demonstration purposes and a tutorial. Built from a fork of the Scotch IO todo app.

Node provides the RESTful API. Angular provides the frontend and accesses the API. MongoDB stores like a hoarder.

The goal of this app is to be a test bed for learning how to develop Alexa skills in 

## Requirements

- [Node and npm](http://nodejs.org)
- MongoDB: Make sure you have your own local or remote MongoDB database URI configured in `config/database.js`

## Installation

1. Clone the repository: `git clone git@github.com:scotch-io/node-todo`
2. Install the application: `npm install`
3. Place your own MongoDB URI in `config/database.js`
3. Start the server: `node server.js`
4. View in browser at `http://localhost:8080`

### For heroku
1. From the terminal window run **heroku create**
2. In the heroku dashboard click on the newly created personal app
3. Click over on the  _Resources_ sub menu and type **mongo** in the Add-on text area
4. Choose a mongo installation (I have used mLab MonggoDB)
5. Once installed click on the Addon (i.e., _mLab MongoDB :: Mongodb_)
4. Add a new user for the application to use
5. Change the mongo url in the repo to the updated remote Url in _config.js_ file
6. Add and commit changes
7. From the terminal run **git push heroku master**
8. From the terminal run **heroku open**

You should see the app running in a browser

