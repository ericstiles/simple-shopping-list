module.exports = function() {
    switch (process.env.NODE_ENV) {
        case 'production':
            return {
                "databaseUrl": 'mongodb://ets:ets@ds127978.mlab.com:27978/heroku_0d43trbz'
            }
        case 'development':
            return {
                "databaseUrl": 'mongodb://localhost/meanstacktutorials'
            }
        default:
            return {
                "error": "No configuration values supplied.\nTry 'NODE_ENV=development node build.js'\nOther value is 'production'."
            }
    }
};
