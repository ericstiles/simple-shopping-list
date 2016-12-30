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

    beforeEach(function(done) {
        let itemOne = new Todo({
        	// _id:'1',
            text: 'Apples',
            quantity: 10,
            price: '2.15'
        });
        itemOne.save(function(err) {
            // done();
        });
        let itemTwo = new Todo({
            text: 'Oranges',
            quantity: 5,
            price: '1.10'
        });
        itemTwo.save(function(err) {
            // done();
        });
        let metalist = new MetaList({
            name: "listone",
            number: 2,
            total: 3.25
        })
        metalist.save(function(err) {
            done();
        });
    });
    afterEach(function(done) {
       Todo.collection.drop();
       MetaList.collection.drop();
       done();
    });
    it('should return complete list of items: /api/list GET', function(done) {
        // console.log("NODE_ENV:" + process.env.NODE_ENV);
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
        // console.log("NODE_ENV:" + process.env.NODE_ENV);
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
        // console.log("NODE_ENV:" + process.env.NODE_ENV);
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
        // console.log("NODE_ENV:" + process.env.NODE_ENV);
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
        // console.log("NODE_ENV:" + process.env.NODE_ENV);
        Todo.where('text', 'Oranges').exec(function(err, todo) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
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
        // console.log("NODE_ENV:" + process.env.NODE_ENV);
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
