const User = require('../../../models/user.model');           // User model
const ApiResponse = require('../../class/ApiResponse');       // Response format
const mailer = require('../../class/Mailer');                 // Mails handler

/**
 * Execute the requested action: add a user
 * Send an email with a confirm token to the new user 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Callback} next 
 */
const exec = function(req, res, next) {
  // request body is already sanitized by the previous middleware: ValidatorGuard.sanitizeBody
  const candidate = new User({
    username: req.body['username'],
    email: req.body['email'],
    password: req.body['password']
  });
  User.create(candidate, (err, results) => {
    if(err) {
      return next(err);
    }
    User.get({field: 'id', value: results.insertId}, (err, user) => {
      if(err) {
        return next(err);
      }
      mailer.sendToken(user, req)
        .then(info => {
          console.log(info);
          return;
        })
        .catch(err => {
          console.log(err);
          return;
        })
    });
    // The response for a succeful user registration is not sent after sending an the confirmation token
    // because sending an email could be slow
    const data = Object.assign({}, results, {info: ` a confirm token has been sent to ${candidate.email}`});
    res.json(new ApiResponse({req, success: true, data }));
  });
}

module.exports = { exec }