# Node Shopping List  App

A Node app built with MongoDB, Express and Angular. For demonstration purposes and a tutorial. Built from a fork of the Scotch IO todo app.

Node provides the RESTful API. Angular provides the frontend and accesses the API. MongoDB stores like a hoarder.

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
1. From cli run heroku create
2. In the heroku dashboard click on the newly created person app
3. Click over to Resources and type mongo in the add-on section
4. Click on the mongo create link and add a user
5. Change the mongo url in the repo to the updated remote Url in database.js and server.js file
6. Add and commit changes
7. git push heroku master
8. Run heroku open

