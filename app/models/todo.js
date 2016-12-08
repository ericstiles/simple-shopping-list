var mongoose = require('mongoose');

module.exports = mongoose.model('Todo', {
    text: {
        type: String,
        default: ''
    },
    quantity: {
    	type: Number,
    	default: '1'
    },
    price: {
    	type: Number,
    	default: '1.99'
    }
},'todos');