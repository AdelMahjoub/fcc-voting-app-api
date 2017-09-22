const dbConnectionPool = require('../db');

/**
 * 
 */
class Poll {

  /**
   * Get all polls
   * @param {function(Error, [object])} cb 
   */
  static all(cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `SELECT 
        Polls.id as pollId, Polls.title, Polls.postDate,
        Users.username as author,
        Options.label as optionLabel, Options.id as optionId, Options.voted
        FROM Polls 
        LEFT JOIN Users ON Polls.userId = Users.id
        LEFT JOIN Options ON Polls.id = Options.pollId
        ORDER BY Polls.postDate DESC
      `;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        connection.release();
        return cb(null, Poll.groupPollsAndOptions(results));
      });
    });
  }

  /**
   * Get a poll by scope.field:value
   * @param {{field: string, value:any, scope: string}} param0 
   * @param {function(Error, [object])} cb 
   * @param {string} scopeTable 
   */
  static get({field, value, scope = 'Polls'}, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `SELECT 
        Polls.id as pollId, Polls.title, Polls.postDate,
        Users.username as author,
        Options.label as optionLabel, Options.id as optionId, Options.voted
        FROM Polls
        LEFT JOIN Users ON Polls.userId = Users.id
        LEFT JOIN Options ON Polls.id = Options.pollId
        WHERE ${connection.escapeId(scope)}.${connection.escapeId(field)} = ${connection.escape(value)}
      `;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        connection.release();
        return cb(null, Poll.groupPollsAndOptions(results));
      });
    });
  }

  /**
   * Insert a new poll and its options respectively in Polls table and Options table
   * @param {number} userId 
   * @param {string} title 
   * @param {[string]} options 
   * @param {function(Error, {poll: {affectedRows: number, insertId: number}, options: {affectedRows: number, message: string}})} cb 
   */
  static create(userId, title, options, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      connection.query(`INSERT INTO Polls SET ?`, {userId, title}, (err, pollResults, fields) => {
        if(err) {
          return cb(err);
        }
        const bulkOptions = options.map(label => [label, pollResults.insertId]);
        connection.query(`INSERT INTO Options(label, pollId) VALUES ?`, [bulkOptions], (err, optionsResults, fields) => {
          if(err) {
            return cb(err);
          }
          connection.release();
          return cb(null, {
            poll: {
              affectedRows: pollResults.affectedRows,
              insertId: pollResults.insertId
            },
            options: {
              affectedRows: optionsResults.affectedRows,
              message: optionsResults.message
            }
          });
        });
      });
    });
  }

  /**
   * Delete a poll by id
   * @param {number} pollId 
   * @param {function(Error, {affectedRows: number, insertId: number})} cb 
   */
  static remove(pollId, cb) {
    dbConnectionPool.getConnection((err, connection) => {
      if(err) {
        return cb(err);
      }
      const sql = `DELETE FROM Polls WHERE id = ${connection.escape(pollId)}`;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          return cb(err);
        }
        connection.release();
        return cb(null, {affectedRows: results.affectedRows, insertId: results.insertId})
      });
    });
  }

  /**
   * The results array returned by the sql query in Poll.all do not group options with their poll
   * Poll.groupPollsAndOptions, loop through that array and group each poll with its options
   * The resulting array is more readable and should be easier to parse by the client
   * @param {[object]} polls 
   */
  static groupPollsAndOptions(polls) {
    // The arry to be returned
    let grouped = [...polls];
    let index = 0;
    if(Boolean(grouped.length)) {
      while(index < grouped.length) {
        let current = grouped[index];
        let next = grouped[index + 1];
        if(!current.hasOwnProperty('options')) {
          current['options'] = [];
        }
        if(next && (next['pollId'] === current['pollId'])) {
          current['options'].push({optionLabel: next.optionLabel, optionId: next.optionId, voted: next.voted});
          grouped.splice(grouped.indexOf(next), 1);
        } else {
          index++;
          current['options'].push({optionLabel: current.optionLabel, optionId: current.optionId, voted: current.voted});
          delete current.optionLabel;
          delete current.optionId;
          delete current.voted;
        }
      }
    }
    return grouped;
  }
}

module.exports = Poll;