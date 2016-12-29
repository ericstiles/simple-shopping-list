// set up ======================================================================
var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var metadata = require('./config/config.js')();

if (metadata.error) {
    console.log(metadata.error);
    process.exit(1);
}

var app = express(); 


// configuration ===============================================================
mongoose.connect(metadata.databaseUrl);
app.use(express.static('./public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
// app.use(function (req, res, next) {
//   res.status(404).send("Sorry can't find that!")
// })

// routes ======================================================================
require('./app/routes.js')(app);

 module.exports = (function() {
    'use strict';
    // listen (start app with node server.js) ======================================
    var port = process.env.PORT || 8080;
    app.listen(port, function() {
        console.log("App listening on port " + port);
    });
    return app;
})();

//module.exports = app;
