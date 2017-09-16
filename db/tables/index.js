// ==============================================================
// If this module is used separately => load env variables
// usually it won't be used separately in a production enviroment
// but env variables are required to test the connecton to the db
// https://github.com/motdotla/dotenv
// ==============================================================
if(!Boolean(process.env.NODE_ENV)) {
  require('dotenv').config();
}

// ==============================================================
// util  https://nodejs.org/dist/latest-v6.x/docs/api/util.html
// fs    https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
// path  https://nodejs.org/dist/latest-v6.x/docs/api/path.html
// ==============================================================
const fs = require('fs');
const path = require('path');
const util = require('util');

const dbConnectionPool = require('..');
const sqlFilePath = path.resolve(__dirname, './sql');

/**
 * Return an array of sql statements
 * The file should contain sql statements to create tables
 * Each sql statement is separated by a `*` 
 * @param {string} filePath 
 */
const getQueriesFromFile = function(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if(err) {
        reject(err);
      }
      resolve(data.toString().split('*'));
    });
  });
}
/**
 * Execute sql statements in serie using recursivity
 * Create the needed tables if not exists
 * @param {object} dbConnectionPool 
 * @param {array} statements 
 * @param {number} index 
 * @param {function(Error)} cb 
 */
const createTables = function(dbConnectionPool, statements, index, cb) {
  if(!Boolean(statements[index])) {
    return cb();
  }
  dbConnectionPool.getConnection((err, connection) => {
    if(err) {
      return cb(err);
    }
    connection.query(statements[index], (err, results, fields) => {
      if(err) {
        return cb(err)
      }
      console.log(`Query: ${index}\nSQL: ${statements[index]}\n`);
      index++;
      connection.release();
      createTables(dbConnectionPool, statements, index, cb);
    });
  });
}

module.exports = function() {
  getQueriesFromFile(sqlFilePath)
    .then(sql => {
      let index = 0;
      createTables(dbConnectionPool, sql, index, (err) => {
        if(err) {
          throw err;
        }
        dbConnectionPool.getConnection((err, connection) => {
          if(err) {
            throw err
          }
          connection.query('SHOW TABLES;', (err, results, fields) => {
            console.log(
              '\nConnection to database established\n', 
              util.inspect({
                threadId: connection.threadId,
                tables: results
              }, false, 2, true)
            );
            connection.release();
          });
        });
      });
    })
    .catch(err => {
      throw(err);
    })
}