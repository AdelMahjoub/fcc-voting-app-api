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
  });

  describe('POST /api/users', () => {
    it('should respond with json', (done) => {
      request(app)
        .get('/api/users')
        .set('Accept', 'application/json')
        .send({})
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          assert(!Boolean(err), 'no errors expected');
          const responseBody = JSON.parse(res.text);
          assert(responseBody.hasOwnProperty('requested'));
          assert(responseBody.hasOwnProperty('success'));
          assert(responseBody.hasOwnProperty('errors'));
          assert(responseBody.hasOwnProperty('data'));
          assert(responseBody.hasOwnProperty('success'));
          done();
        });
    });
  });

});
