const mocha = require('mocha');
const assert = require('assert');
const request = require('supertest');

const app = require('../server');

describe('api', () => {
  describe('GET /api/users', () => {
    it('should respond with json', (done) => {
      request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
    describe('json response', () => {
      let response;
      before((done) => {
         request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          response = JSON.parse(res.text);
          done();
        });
      });
      it('should have a requested property', () => {
        assert(response.hasOwnProperty('requested'));
      });
      it('should have a success property', () => {
        assert(response.hasOwnProperty('success'));
      });
      it('should have an errors property', () => {
        assert(response.hasOwnProperty('errors'));
      });
      it('should have a data property', () => {
        assert(response.hasOwnProperty('data'));
      });
      it('should have a timestamp property', () => {
        assert(response.hasOwnProperty('timestamp'));
      });
      describe('requested property', () => {
        it('should be a string', () => {
          assert.equal(typeof response.requested, 'string');
        });
        it('should not be an empty string', () => {
          assert(Boolean(response.requested));
        });
      });
      describe('success property', () => {
        it('should be a boolean', () => {
          assert.equal(typeof response.success, 'boolean');
        });
        it('should be a true', () => {
          assert(response.success);
        });
      });
      describe('errors property', () => {
        it('should be an array', () => {
          assert(Array.isArray(response.errors))
        });
      });
      describe('data property', () => {
        it('should be an array', () => {
          assert(Array.isArray(response.data));
        });
      });
      describe('timestamp property', () => {
        it('should be a string', () => {
          assert.equal(typeof response.timestamp, 'string');
        });
        it('should not be an empty string', () => {
          assert(Boolean(response.timestamp));
        });
      });
    });
  });
});
