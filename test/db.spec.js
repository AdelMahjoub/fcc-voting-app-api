const mocha = require('mocha');
const assert = require('assert');

const dbConnectionsPool = require('../db');

describe('dbConnectionPool', () => {

  describe('.getConnection', () => {
    it('should return a connection thread', (done) => {
      dbConnectionsPool.getConnection((err, connection) => {
        assert.ok(connection.threadId);
        done();
      });
    });

    describe('connection', () => { 
      let conn;
      const truthySql = 'SHOW TABLES;'
      const falsySql = 'SELECT FOO BAR;'
      beforeEach((done) => {
        dbConnectionsPool.getConnection((err, connection) => {
          conn = connection;
          done();
        });
      });

      it('should query truthy sql statements', (done) => {
        conn.query(truthySql, (err, results, fields) => {
          assert.equal(Boolean(err), false);
          conn.release();
          done();
        });
      });

      it('should throw an error on falsy sql statements', (done) => {
        conn.query(falsySql, (err, results, fields) => {
          assert.equal(Boolean(err), true);
          conn.release();
          done();
        });
      });
    });
  });
});