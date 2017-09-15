if(!Boolean(process.env.NODE_ENV)) {
  require('dotenv').config();
}
const fs = require('fs');
const path = require('path');
const util = require('util');

const dbConnectionPool = require('..');
const sqlFilePath = path.resolve(__dirname, './sql');

/**
 * Return an array of sql statements
 * The file should contain sql statements to create tables
 * Each sql statement is separated by a `*` 
 * The table names inside the file should be prefixed by %
 * The prefix will be replaced by the app name
 * @param {string} filePath 
 */
const getQueriesFromFile = function(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if(err) {
        reject(err);
      }
      resolve(
        data.toString()
          .replace(/%/g, process.env.APP_NAME)
          .split('*')
      );
    });
  });
}
/**
 * Query sql statements in serie using recursivity
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