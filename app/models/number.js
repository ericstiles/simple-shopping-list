var mongoose = require('mongoose');

module.exports = mongoose.model('Number', {
    order: {
        type: String,
        default: ''
    },
    value: {
    	type: Number,
    	default: '1'
    }
},'numbers');