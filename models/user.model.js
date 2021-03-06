// ==============================================================
// bcrypt  https://github.com/kelektiv/node.bcrypt.js
// shortid https://github.com/dylang/shortid
// ==============================================================
const bcrypt = require('bcrypt');
const shortid = require('shortid');

const dbConnectionPool = require('../db');

class User {
  /**
   * Instanciate new instances of User (Really ? this is serious stuff !)
   * @param {{username: string, email: string, password: string}} props 
   */
  constructor(props) {
    this.username = props['username'];
    this.email = props['email'];
    this.password = props['password'];
  }

  /**
   * Get all users
   * @param {function(Error, array)} cb 
   */
  static all(cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = 'SELECT username, email, confirmed, registerDate FROM Users';
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        connection.release();
        return cb(null, results);
      });
    });
  }

  /**
   * Get a user by field: value
   * @param {{field: string, value: any}} param0 
   * @param {function(Error, object)} cb 
   */
  static get({field, value}, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `SELECT * FROM Users WHERE ${connection.escapeId(field)} = ${connection.escape(value)}`;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        connection.release();
        return cb(null, results[0]);
      });
    });
  }

  /**
   * Insert a new user
   * @param {{username: string, email: string, password: string}} user 
   * @param {function(Error, {affectedRows: number, insertId: number})} cb 
   */
  static create(user, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      User.hashPassword(user.password, (err, hashed) => {
        if(err) {
          return cb(err);
        }
        user.password = hashed;
        const sql = `INSERT INTO 
          Users (username, email, password, confirmToken)
          VALUES (
            ${connection.escape(user.username)},
            ${connection.escape(user.email)},
            '${user.password}',
            '${User.genConfirmToken()}'
          )`;
        connection.query(sql, (err, results, fields) => {
          if(err) {
            return cb(err);
          }
          connection.release();
          return cb(null, {affectedRows: results.affectedRows, insertId: results.insertId});
        });
      });
    });
  }

  /**
   * Delete a user by id
   * @param {number} userId 
   * @param {function(Error, {affectedRows: number, insertId: number})} cb 
   */
  static removeById(userId, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `DELETE FROM Users WHERE id = ${connection.escape(userId)}`;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        connection.release();
        return cb(null, {affectedRows: results.affectedRows, insertId: results.insertId});
      });
    });
  }

  /**
   * todo: test
   * Update user data
   * @param {number} id
   * @param {{username: string, email: string, password: string}} data
   * @param {function(Error, {affectedRows: number, insertId: number})} cb
   */
  static update(id, data, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `UPDATE Users SET ? WHERE id = ${connection.escape(id)}`;
      if('password' in data) {
        User.hashPassword(data.password, (err, hash) => {
          if(err) {
            return cb(err)
          }
          data.password = hash;
          connection.query(sql, data, (err, results, fields) => {
            if(err) {
              return cb(err);
            }
            connection.release();
            return cb(null, {affectedRows: results.affectedRows, insertId: results.insertId});
          });
        });
      } else {
        connection.query(sql, data, (err, results, fields) => {
          if(err) {
            return cb(err);
          }
          connection.release();
          return cb(null, {affectedRows: results.affectedRows, insertId: results.insertId});
        });
      }
    });
  }

  /**
   * Get a user by email or username
   * @param {string} identifier 
   * @param {function(Error, User)} cb 
   */
  static getByEmailOrUsername(identifier, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `SELECT * FROM Users WHERE
        email = ${connection.escape(identifier)}
        OR username = ${connection.escape(identifier)}`;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        connection.release()
        return cb(null, results[0]);
      });
    });
  }

  /**
   * Confirm a user
   * Set confirm field to 1(TRUE)
   * @param {number} userId 
   * @param {function(Error, {affectedRows: number, insertId: number})} cb 
   */
  static confirm(userId, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `UPDATE Users SET confirmed = 1 WHERE id = ${connection.escape(userId)}`;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        connection.release();
        return cb(null, {affectedRows: results.affectedRows, insertId: results.insertId});
      });
    });
  }

  /**
   * Number of rounds to generate a salt
   */
  static saltRounds() {
    return 10;
  }

  /**
   * Hash a string then return the hash
   * @param {string} toHash 
   * @param {function(Error, string)} cb 
   */
  static hashPassword(toHash, cb) {
    bcrypt.genSalt(User.saltRounds(), (err, salt) => {
      if(err) {
        return cb(err);
      }
      bcrypt.hash(toHash, salt, (err, hashed) => {
        if(err) {
          return cb(err);
        }
        return cb(null, hashed);
      });
    });
  }

  /**
   * Compare a hashed password with a guess string
   * @param {string} guess 
   * @param {string} hash 
   * @param {function(Error, boolean)} cb 
   */
  static comparePasswords(guess, hash, cb) {
    bcrypt.compare(guess, hash, (err, isMatch) => {
      if(err) {
        return cb(err);
      }
      return cb(null, isMatch);
    });
  }

  /**
   * Return a unique short string
   */
  static genConfirmToken() {
    return shortid.generate();
  }
}

module.exports = User;
