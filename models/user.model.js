const bcrypt = require('bcrypt');

const dbConnectionPoll = require('../db');

class User {
  /**
   * 
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
    dbConnectionPoll.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = 'SELECT username, email, confirmed, registerDate FROM Users';
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        return cb(null, results);
      });
      connection.release();
    });
  }

  /**
   * Get a user by field: value
   * @param {{field: string, value: any}} param0 
   * @param {function(Error, object)} cb 
   */
  static get({field, value}, cb) {
    dbConnectionPoll.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `SELECT * FROM Users WHERE ${connection.escapeId(field)} = ${connection.escape(value)}`;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        return cb(null, results);
        connection.release();
      });
    });
  }

  /**
   * Insert a new user
   * @param {{username: string, email: string, password: string}} user 
   * @param {function(Error, any)} cb 
   */
  static create(user, cb) {
    dbConnectionPoll.getConnection((err, connection) => {
      User.hashPassword(user.password, (err, hashed) => {
        if(err) {
          return cb(err);
        }
        user.password = hashed;
        const sql = `INSERT INTO 
          Users (username, email, password)
          VALUES (
            ${connection.escape(user.username)},
            ${connection.escape(user.email)},
            '${user.password}'
          )`;
        connection.query(sql, (err, results, fields) => {
          if(err) {
            return cb(err);
          }
          return cb(null, results);
        });
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
}

module.exports = User;