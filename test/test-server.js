process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let mongoose = require("mongoose");

let server = require('../server');
let Todo = require("../app/models/todo");
var MetaList = require('../app/models/metalist');
var Numba = require('../app/models/number');

let should = chai.should();
chai.use(chaiHttp);


describe('List Items', function() {

    Todo.collection.drop();
    MetaList.collection.drop();
    Numba.collection.drop();

    beforeEach(function(done) {
        new Todo({ text: 'Apples', quantity: 10, price: '2.15' }).save(function(err) {});
        new Todo({ text: 'Oranges', quantity: 5, price: '1.10' }).save(function(err) {});
        let metalist = new MetaList({
            name: "listone",
            number: 2,
            total: 3.25
        })
        metalist.save(function(err) {});
        new Numba({ order: 'first', value: 1 }).save(function(err) {});
        new Numba({ order: '1st', value: 1 }).save(function(err) {});
        new Numba({ order: 'second', value: 2 }).save(function(err) {});
        new Numba({ order: '2nd', value: 2 }).save(function(err) {});
        new Numba({ order: 'third', value: 3 }).save(function(err) {});
        new Numba({ order: '3rd', value: 3 }).save(function(err) {
            done();
        });

    });
    afterEach(function(done) {
        Todo.collection.drop();
        MetaList.collection.drop();
        Numba.collection.drop();
        done();
    });
    it('should return complete list of items: /api/list GET', function(done) {
        chai.request(server)
            .get('/api/list')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.length(2);
                done();
            });
    });
    it('should add a new list item and return complete list of items: /api/list POST', function(done) {
        chai.request(server)
            .post('/api/list')
            .send({
                text: 'Bananas',
                quantity: 2,
                price: '1.10'
            })
            .end(function(err, res) {

                if (err) {
                    console.log(err);
                }

                res.should.have.status(200);
                res.should.be.json;
                res.body.should.have.length(3);
                done();
            });
    });
    it('should return meta information about list: /api/metalist GET', function(done) {
        chai.request(server)
            .get('/api/metalist')
            .end(function(err, res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.include({
                    name: "listone",
                    number: 2,
                    total: 3.25,
                    cTotal: "$3.25"
                });
                done();
            });
    });
    it('should add a new item and add the total price and quantity to the metalist: /api/metalist/add POST', function(done) {
        chai.request(server)
            .post('/api/metalist/add')
            .send({
                text: 'Bananas',
                quantity: 2,
                price: '1.10'
            })
            .end(function(err, res) {
                if (err) {
                    console.log(err);
                }
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.include({
                    name: "listone",
                    number: 3,
                    total: 4.35,
                    cTotal: "$4.35"
                });
                done();
            });
    });
    it('should remove an item by id subtracting the total price and quantity from the metalist: /api/metalist/subtract POST', function(done) {
        Todo.where('text', 'Oranges').exec(function(err, todo) {
            if (err) {
                res.send(err);
            }
            console.log("todo:->" + JSON.stringify(todo[0]));
            console.log("todo._id:->" + todo[0]._id);
            chai.request(server)
                .post('/api/metalist/subtract')
                .send({
                    id: todo[0]._id
                })
                .end(function(err, res) {
                    if (err) {
                        console.log(err.message);
                    }
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.include({
                        name: "listone",
                        number: 1,
                        total: 2.15,
                        cTotal: "$2.15"
                    });
                    done();
                });
        });

    });
    it('should return a 500 and error message when subtracting using an invalid id: /api/metalist/subtract POST', function(done) {
        chai.request(server)
            .post('/api/metalist/subtract')
            .send({
                id: '1'
            })
            .end(function(err, res) {
                if (err) {
                    console.log(err.message);
                }
                res.should.have.status(500);
                res.should.be.json;
                res.body.should.include({ error: "Not a valid id:1" });
                done();
            });
    });

});

describe('Order Items', function() {
    Todo.collection.drop();
    MetaList.collection.drop();
    Numba.collection.drop();
    beforeEach(function(done) {
        new Numba({ order: 'first', value: 1 }).save(function(err) {});
        new Numba({ order: '1st', value: 1 }).save(function(err) {});
        new Numba({ order: 'second', value: 2 }).save(function(err) {});
        new Numba({ order: '2nd', value: 2 }).save(function(err) {});
        new Numba({ order: 'third', value: 3 }).save(function(err) {});
        new Numba({ order: '3rd', value: 3 }).save(function(err) {
            done();
        });
    });
    afterEach(function(done) {
        Todo.collection.drop();
        MetaList.collection.drop();
        Numba.collection.drop();
        done();
    });
    it('should return the first list item given first when one item in list: /api/list/:item_id GET', function(done) {
        new Todo({ text: 'Apples', quantity: 10, price: '2.15' }).save(function(err) {});
        let value = "first"
        chai.request(server)
            .get('/api/list/' + value)
            .end(function(err, res) {
                console.log("res.body:" + JSON.stringify(res.body));
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.include({
                    text: 'Apples',
                    quantity: 10,
                    price: 2.15
                });
                done();
            });
    });
    it('should return the first list item given 1st when one item in list: /api/list/:item_id GET', function(done) {
        new Todo({ text: 'Apples', quantity: 10, price: '2.15' }).save(function(err) {});
        let value = "1st"
        chai.request(server)
            .get('/api/list/' + value)
            .end(function(err, res) {
                console.log("res.body:" + JSON.stringify(res.body));
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.include({
                    text: 'Apples',
                    quantity: 10,
                    price: 2.15
                });
                done();
            });
    });
    it('should return the second list item given 2nd when two items in list: /api/list/:item_id GET', function(done) {
        new Todo({ text: 'Apples', quantity: 10, price: '2.15' }).save(function(err) {});
        new Todo({ text: 'Oranges', quantity: 10, price: '2.15' }).save(function(err) {});
        let value = "2nd"
        chai.request(server)
            .get('/api/list/' + value)
            .end(function(err, res) {
                console.log("res.body:" + JSON.stringify(res.body));
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.include({
                    text: 'Oranges',
                    quantity: 10,
                    price: 2.15
                });
                done();
            });
    });
    it('should return the second list item given 2nd when three items in list: /api/list/:item_id GET', function(done) {
        new Todo({ text: 'Apples', quantity: 10, price: '2.15' }).save(function(err) {});
        new Todo({ text: 'Oranges', quantity: 10, price: '2.15' }).save(function(err) {});
        new Todo({ text: 'Bananas', quantity: 10, price: '2.15' }).save(function(err) {});
        let value = "2nd"
        chai.request(server)
            .get('/api/list/' + value)
            .end(function(err, res) {
                console.log("res.body:" + JSON.stringify(res.body));
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.include({
                    text: 'Oranges',
                    quantity: 10,
                    price: 2.15
                });
                done();
            });
    });
    it('should return a 500 and error message when order number is not valid: /api/list/:item_id GET', function(done) {
        new Todo({ text: 'Apples', quantity: 10, price: '2.15' }).save(function(err) {});
        var value = "2nd"
        chai.request(server)
            .get('/api/list/' + value)
            .end(function(err, res) {
                console.log("err.message:" + JSON.stringify(err.message));
                res.should.have.status(500);
                res.should.be.json;
                res.body.should.have.property('error')
            });
        value = "0";
        chai.request(server)
            .get('/api/list/' + value)
            .end(function(err, res) {
                console.log("res.body:" + JSON.stringify(res.body));
                res.should.have.status(500);
                res.should.be.json;
                res.body.should.have.property('error')
                done();
            });
    });
});
