process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require("mongoose");

var server = require('../server');
var Todo = require("../app/models/todo");

var should = chai.should();
chai.use(chaiHttp);


describe('Todos', function() {

    Todo.collection.drop();

    beforeEach(function(done) {
        var newBlob = new Todo({
            text: 'Bat',
            quantity: 1
        });
        newBlob.save(function(err) {
            done();
        });
    });
    afterEach(function(done) {
        Todo.collection.drop();
        done();
    });
    it('should make a call to an api that doesn\'t exist: /blobs POST', function(done) {
    	console.log("NODE_ENV:" + process.env.NODE_ENV);
        chai.request(server)
            .post('/blobs')
            .send({ 'name': 'Java', 'lastName': 'Script' })
            .end(function(err, res) {
                res.should.have.status(404);
                //res.should.be.json;
                // res.body.should.be.a('object');
                // res.body.should.have.property('SUCCESS');
                // res.body.SUCCESS.should.be.a('object');
                // res.body.SUCCESS.should.have.property('name');
                // res.body.SUCCESS.should.have.property('lastName');
                // res.body.SUCCESS.should.have.property('_id');
                // res.body.SUCCESS.name.should.equal('Java');
                // res.body.SUCCESS.lastName.should.equal('Script');
                done();
            });
    });
    it('should list a SINGLE blob on /blob/<id> GET');
    it('should add a SINGLE blob on /blobs POST');
    it('should update a SINGLE blob on /blob/<id> PUT');
    it('should delete a SINGLE blob on /blob/<id> DELETE');
});
