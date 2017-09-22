const { check, validationResult } = require('express-validator/check');

const AuthGuard = require('../class/AuthGuard');
const ValidatorGuard = require('../class/ValidatorGuard');
const dbConnection = require('../../db');
const ApiResponse = require('../class/ApiResponse');

class VoteController {

  /**
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static vote(req, res, next) {
    const pollId = req.body.pollId;
    const optionId = req.body.optionId;
    const userId = req.user.id;
    dbConnection.getConnection((err, connection) => {
      if(err) {
        console.log(err);
        return next(new Error('Server error, please try again'));
      }
      let sql = `SELECT * FROM Polls, Options 
        WHERE 
        Polls.id = ${connection.escape(pollId)} AND 
        Options.id = ${connection.escape(optionId)}`;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          console.log(err);
          return next(new Error('Server error, please try again'));
        }
        if(!Boolean(results.length)) {
          connection.release();
          return res.json(new ApiResponse({
            req,
            success: false,
            errors: ['Invalid vote']
          }));
        }
        sql = `SELECT * FROM Votes WHERE pollId = ${connection.escape(pollId)} AND userId = ${connection.escape(userId)}`;
        connection.query(sql, (err, results, fields) => {
          if(err) {
            console.log(err);
            return next(new Error('Server error, please try again'));
          }
          if(Boolean(results.length)) {
            connection.release();
            return res.json(new ApiResponse({
              success: false,
              req,
              errors: ['Already voted in this poll']
            }));
          }
          sql = `INSERT INTO Votes SET ?`;
          const vote = {userId, pollId, optionId};
          connection.query(sql, vote, (err, results, fields) => {
            if(err) {
              console.log(err);
              return next(new Error('Server error, please try again'));
            }
            sql = `UPDATE Options SET voted = voted + 1 WHERE id = ${connection.escape(optionId)}`;
            connection.query(sql, (err, results, fields) => {
              if(err) {
                console.log(err);
                return next(new Error('Server error, please try again'));
              }
              return res.json(new ApiResponse({
                req,
                success: true,
                data: results
              }));
            });
          });
        });
      });
    });
  }

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  static myVotedOption(req, res, next) {
    const userId = req.user.id;
    const pollId = req.params.pollId;
    dbConnection.getConnection((err, connection) => {
      if(err) {
        console.log(err);
        return next(new Error('Server error, please try again'));
      }
      const sql = `SELECT Votes.optionId, Options.label 
        FROM Votes 
        LEFT JOIN Options ON Votes.optionId = Options.id
        WHERE Votes.userId = ${connection.escape(userId)}
        AND Votes.pollId = ${connection.escape(pollId)}`;
      connection.query(sql, (err, results, fields) => {
        if(err) {
          console.log(err);
          return next(new Error('Server error, please try again'));
        }
        return res.json(new ApiResponse({
          req,
          success: true,
          data: results
        }));
      });
    });
  }

}

module.exports = VoteController;
