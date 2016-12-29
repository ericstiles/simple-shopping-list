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
            number: 0,
            total: 3.25
        })
        metalist.save(function(err) {
            done();
        });
    });
    afterEach(function(done) {
        Todo.collection.drop();
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
                res.body[0].should.include({ text: 'Apples' });
                res.body[1].should.include({ text: 'Oranges' });
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
                res.body[0].should.include({ text: 'Apples' });
                res.body[1].should.include({ text: 'Oranges' });
                res.body[2].should.include({ text: 'Bananas' });
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
                    number: 0,
                    total: 3.25,
                    cTotal: "$3.25"
                });
                done();
            });
    });
    // it('should return complete list: /api/todos GET', function(done) {
    // 	console.log("NODE_ENV:" + process.env.NODE_ENV);
    //     chai.request(server)
    //         .get('/api/todos')
    //         .end(function(err, res) {
    //             res.should.have.status(200);
    //             console.log(JSON.stringify(res));
    //             //res.should.be.json;
    //             // res.body.should.be.a('object');
    //             // res.body.should.have.property('SUCCESS');
    //             // res.body.SUCCESS.should.be.a('object');
    //             // res.body.SUCCESS.should.have.property('name');
    //             // res.body.SUCCESS.should.have.property('lastName');
    //             // res.body.SUCCESS.should.have.property('_id');
    //             // res.body.SUCCESS.name.should.equal('Java');
    //             // res.body.SUCCESS.lastName.should.equal('Script');
    //             done();
    //         });
    // });
    // it('should list a SINGLE blob on /blob/<id> GET');
    // it('should add a SINGLE blob on /blobs POST');
    // it('should update a SINGLE blob on /blob/<id> PUT');
    // it('should delete a SINGLE blob on /blob/<id> DELETE');
});
