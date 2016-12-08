var mongoose = require('mongoose');

module.exports = mongoose.model('MetaList', {
    name: {
        type: String,
        default: ''
    },
    number: {
    	type: Number,
    	default: '0'
    },
    total: {
    	type: Number,
    	default: '0'
    }
}, 'metalist');