'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var mongoose = require('mongoose');

var DEFAULT_CALL = {
  _id: '12345567-89ab-4cde-8f01-23456789abcd',
  digits: '1234'
};

var collection = mongoose.connection.collections['calls'];

var _populateCollection = function(done) {
  collection.drop(function() {
    collection.insert(DEFAULT_CALL, done)
  });
};

var _dropCollection = function(done) {
  collection.drop(done);
};

var _findById = function (id, callback) {
  collection.find({'_id': id}).toArray(callback);
};

describe('/api/v1/calls', function() {

  describe('GET', function() {
    before(_populateCollection);
    after(_dropCollection);

    it('should respond with JSON array', function(done) {
      request(app)
        .get('/api/v1/calls')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Array);
          done();
        });
    });

    it('should return the full model', function(done) {
      request(app)
        .get('/api/v1/calls')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          var call = res.body[0];
          call.should.be.instanceof(Object);
          call._id.should.be.instanceOf(String);
          call._id.should.be.equal(DEFAULT_CALL._id);
          call.digits.should.be.instanceOf(String);
          call.digits.should.be.equal(DEFAULT_CALL.digits);
          done();
        });
    });
  });

  describe('POST', function() {
    afterEach(_dropCollection);

    it('should add an element in the database', function(done) {
      request(app)
        .post('/api/v1/calls')
        .send(DEFAULT_CALL)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          _findById(DEFAULT_CALL._id, function (err, elements) {
            if (err) throw done(err);

            elements.should.have.length(1);
            var call = elements[0];
            call._id.should.be.equal(DEFAULT_CALL._id);
            call.digits.should.be.equal(DEFAULT_CALL.digits);
            done();
          })
        });
    });

    it('should add handle a Plivo request', function(done) {
      var plivoPartialBody = {
        CallUUID: DEFAULT_CALL._id,
        Digits: DEFAULT_CALL.digits
      };

      request(app)
        .post('/api/v1/calls')
        .send(plivoPartialBody)
        .set('x-plivo-cloud', 'v1')
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          _findById(DEFAULT_CALL._id, function (err, elements) {
            if (err) throw done(err);

            elements.should.have.length(1);
            var call = elements[0];
            call._id.should.be.equal(DEFAULT_CALL._id);
            call.digits.should.be.equal(DEFAULT_CALL.digits);
            done();
          })
        });
    });
  });

  describe('/:id', function() {
    describe('GET', function () {
      before(_populateCollection);

      it('should return digits and _id', function(done) {
        request(app)
          .get('/api/v1/calls/' + DEFAULT_CALL._id)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);
            var call = res.body;
            call.should.be.instanceof(Object);
            call.digits.should.be.instanceOf(String);
            call._id.should.be.instanceOf(String);
            done();
          });
      });
    });

    describe('DELETE', function () {
      beforeEach(_populateCollection);

      it('should remove the element in the database', function(done) {
        request(app)
          .delete('/api/v1/calls/' + DEFAULT_CALL._id)
          .expect(204)
          .end(function(err, res){
            if (err) return done(err);
            // Check that the element is not in the database anymore
            _findById(DEFAULT_CALL._id, function(err, elements){
              if (err) throw done(err);
              elements.should.have.length(0);
              done();
            });
          })
      });
    });
  });
});
