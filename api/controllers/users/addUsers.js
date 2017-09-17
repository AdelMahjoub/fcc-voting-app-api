// =======================================================================
// express-validator https://github.com/ctavan/express-validator
// validator         https://github.com/chriso/validator.js
// dns               https://nodejs.org/dist/latest-v6.x/docs/api/dns.html
// =======================================================================
const { check, validationResult } = require('express-validator/check');
const validator = require('validator');
const dns = require('dns'); 

const User = require('../../../models/user.model');
const ApiResponse = require('../../class/ApiResponse');
const mailer = require('../../class/Mailer');

/**
 * req.body validation chain
 */
const validate = [
  check('email')
    .exists()
    .withMessage('An email address should be provided')
    .not()
    .isEmpty()
    .withMessage('The email address is required')
    .isEmail()
    .withMessage('Not a valid email address')
    .custom(value => {
      const email = validator.escape(value);
      return new Promise((resolve, reject) => {
        User.get({field: 'email', value: email}, (err, user) => {
          if(err) {
            reject(new Error('Api error, please try again'));
          }
          if(Boolean(user)) {
            reject(new Error('This email address is already in use'))
          }
          resolve(true);
        });
      });
    })
    .custom(value => {
      const emailHostname = value.split('@')[1];
      return new Promise((resolve, reject) => {
        dns.resolveMx(emailHostname, (err, mxRecords) => {
          if(err || !Boolean(mxRecords.length)) {
            reject(new Error('The email address do not exists or is temporary unavailable'))
          }
          resolve(true);
        });
      });
    }),
  check('username')
    .exists()
    .withMessage('A username should be provided')
    .not()
    .isEmpty()
    .withMessage('The username is required')
    .isAlphanumeric()
    .withMessage('The username should not contain special characters')
    .isLength({min: 4, max: 8})
    .withMessage('The username length should be between 4 and 8 characters')
    .custom(value => {
    const username = validator.escape(value);
    return new Promise((resolve, reject) => {
      User.get({field: 'username', value: username}, (err, user) => {
        if(err) {
          reject(new Error('Api error, please try again'))
        }
        if(Boolean(user)) {
          reject(new Error('This username is already in use'))
        }
        resolve(true);
        });
      });
    }),
  check('password')
  .exists()
  .withMessage('A password should be provided')
  .not()
  .isEmpty()
  .withMessage('The password is required')
  .isLength({min: 6, max: 12})
  .withMessage('The password length should be between 6 and 12 characters')
];

/**
 * Collect validation errors
 * @param {Request} req 
 * @param {Response} res 
 * @param {Callback} next 
 */
const collectErrors = function(req, res, next) {
  const validationErrors = validationResult(req);
  let errors = [];
  if(!validationErrors.isEmpty()) {
    Object.keys(validationErrors.mapped()).forEach(field => {
      errors.push(validationErrors.mapped()[field]['msg']);
    });
    return res.json(new ApiResponse({req, success: false, errors}))
  }
  return next();
};

/**
 * Execute the requested action: add a user
 * Send an email with a confirm token to the new user 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Callback} next 
 */
const exec = function(req, res, next) {
  const candidate = new User({
    username: validator.escape(req.body['username']),
    email: validator.escape(req.body['email']),
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
          const data = Object.assign({}, results, {info: ` a confirm token has been sent to ${user.email}`});
          return res.json(new ApiResponse({req, success: true, data }));
        })
        .catch(err => {
          return next(err);
        })
    });
  });
}

module.exports = { validate, exec, collectErrors }