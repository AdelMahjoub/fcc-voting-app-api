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
        .post('/api/users')
        .set('Accept', 'application/json')
        .send({})
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

  describe('POST /api/users/confirm', () => {
    it('should respond with json', (done) => {
      request(app)
        .post('/api/users')
        .set('Accept', 'application/json')
        .send({})
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

  describe('POST /api/authenticate', () => {
    it('should respond with json', (done) => {
      request(app)
        .post('/api/users')
        .set('Accept', 'application/json')
        .send({})
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

  describe('GET /api/users/:id', () => {
    it('should respond with json', (done) => {
      request(app)
        .get('/api/users/0')
        .set('Accept', 'application/json')
        .send({})
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

  describe('PATCH /api/users/:id', () => {
    it('should respond with json', (done) => {
      request(app)
        .patch('/api/users/0')
        .set('Accept', 'application/json')
        .send({})
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

  describe('DELETE /api/users/:id', () => {
    it('should respond with json', (done) => {
      request(app)
        .delete('/api/users/0')
        .set('Accept', 'application/json')
        .send({})
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

});
