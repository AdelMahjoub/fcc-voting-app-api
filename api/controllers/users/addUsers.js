// ==============================================================
// express-validator https://github.com/ctavan/express-validator
// validator         https://github.com/chriso/validator.js
// ==============================================================
const { check, validationResult } = require('express-validator/check');
const validator = require('validator');

const User = require('../../../models/user.model');
const ApiResponse = require('../../class/ApiResponse');

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
    return res.json(new ApiResponse({req, success: true, data: results}));
  });
}

module.exports = { validate, exec, collectErrors }