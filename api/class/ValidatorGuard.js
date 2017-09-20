// =======================================================================
// express-validator https://github.com/ctavan/express-validator
// validator         https://github.com/chriso/validator.js
// dns               https://nodejs.org/dist/latest-v6.x/docs/api/dns.html
// =======================================================================
const { check, validationResult} = require('express-validator/check');
const validator = require('validator');
const dns = require('dns'); 

const ApiResponse = require('./ApiResponse');        // Response format

const User = require('../../models/user.model');     // User model
const Poll = require('../../models/poll.model');     // Poll model
const Option = require('../../models/option.model'); // Option model
const Vote = require('../../models/vote.model');     // Vote model

/**
 * Handle all validation
 * If a route is protected the validator should run after the AuthGuard
 */
class ValidatorGuard {

  /**
   * Validate emails
   * 
   * if optional equal true validation is only performed if the field exists
   * @param {{optional :boolean}} param0 
   */
  static checkEmail({optional = false} = {}) {
    return (
      check('email')
      [!optional ? 'exists' : 'optional']()
      .withMessage('An email address should be provided')
      .not()
      .isEmpty()
      .withMessage('The email address should not be empty')
      .isEmail()
      .withMessage('Not a valid email address')
      .custom(ValidatorGuard.isUniqueEmail)
      .custom(ValidatorGuard.hasMxRecords)
    )
  }

  /**
   * Validate usernames
   * 
   * if optional equal true validation is only performed if the field exists
   * @param {{optional :boolean}} param0 
   */
  static checkUsername({optional = false} = {}) {
    return (
      check('username')
      [!optional ? 'exists' : 'optional']()
      .withMessage('A username should be provided')
      .not()
      .isEmpty()
      .withMessage('The username should not be empty')
      .isAlphanumeric()
      .withMessage('The username should not contain special characters')
      .isLength({min: 4, max: 8})
      .withMessage('The username length should be between 4 and 8 characters')
      .custom(ValidatorGuard.isUniqueUsername)
    )
  }

  /**
   * Validate passwords
   * 
   * if optional equal true validation is only performed if the field exists
   * @param {{optional :boolean}} param0 
   */
  static checkPassword({optional = false} = {}) {
    return (
      check('password')
      [!optional ? 'exists' : 'optional']()
      .withMessage('A password should be provided')
      .not()
      .isEmpty()
      .withMessage('The password should not be empty')
      .isLength({min: 6, max: 12})
      .withMessage('The password length should be between 6 and 12 characters')
    )
  }

  /**
   * When a user is updating his password
   * Check wether the password has changed or not
   * The check is only performed if a password field exists
   */
  static passwordHasChanged() {
    return (
      check('password')
      .optional()
      .custom((value, {req, location, path}) => {
        return new Promise((resolve, reject) => {
          const newPassword = ValidatorGuard.decodeAndEscape(value);
          const id = parseInt(ValidatorGuard.decodeAndEscape(req.params.id), 10);
          User.get({field: 'id', value: id}, (err, user) => {
            if(err) {
              console.log(err);
              reject(new Error('Server error, please try again'));
            }
            if(!Boolean(user)) {
              reject(new Error('No such user'))
            }
            User.comparePasswords(newPassword, user.password, (err, isMatch) => {
              if(err) {
                console.log(err)
                reject(new Error('Server error, please try again'));
              }
              if(isMatch) {
                reject(new Error('Password unchanged, new password should be different than the previous one'))
              }
              resolve(true);
            });
          });
        });
      })
    )
  }

  /**
   * Validate users ids
   */
  static checkUserId() {
    return (
      check('id')
      .not()
      .isEmpty()
      .withMessage('The user id should not be empty')
      .isNumeric()
      .withMessage('The user id should be numeric ')
      .custom(ValidatorGuard.idExist)
    )
  }

  /**
   * Check a required field
   * @param {string} field 
   */
  static fieldRequired(field) {
    return (
    check(field)
      .exists()
      .withMessage(`${field} is required`)
      .not()
      .isEmpty()
      .withMessage(`${field} is required`)
    )
  }

  /**
   * Kepp only the required fields
   * @param {[string]} fieldsToKeep 
   */
  static filterBody(fieldsToKeep) {
    return function(req, res, next) {
      Object.keys(req.body).forEach(key => {
        if(!fieldsToKeep.includes(key)) {
          delete req.body[key];
        }
      });
      return next();
    }
  }

  /**
   * Sanitize the request body
   * Should run after Validation
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static sanitizeBody(req, res, next) {
    Object.keys(req.body).forEach(field => {
      const sanitizedValue = ValidatorGuard.decodeAndEscape(req.body[field]);
      const sanitizedKey = ValidatorGuard.decodeAndEscape(field);
      delete req.body[field];
      req.body[sanitizedKey] = sanitizedValue;
    });
    return next();
  }

  /**
   * Sanitize ids from  request params
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static sanitizeIds(req, res, next) {
    req.params.id = parseInt(ValidatorGuard.decodeAndEscape(req.params.id), 10);
    return next();
  }

  /**
   * Decode URI encoded components and escape html
   * @param {any} value 
   */
  static decodeAndEscape(value) {
    return validator.escape(decodeURIComponent(value));
  }

  /**
   * Collect validation errors and respond if find any
   * @param {Request} req 
   * @param {Response} res 
   * @param {Callback} next 
   */
  static collectErrors(req, res, next) {
    const validationErrors = validationResult(req);
    let errors = [];
    if(!validationErrors.isEmpty()) {
      Object.keys(validationErrors.mapped()).forEach(field => {
        errors.push(validationErrors.mapped()[field]['msg']);
      });
      return res.json(new ApiResponse({req, errors}))
    }
    return next();
  }

  /**
   * Check if the email address is unique
   * @param {string} value 
   */
  static isUniqueEmail(value) {
    const email = ValidatorGuard.decodeAndEscape(value);
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
  }

  /**
   * Check if the email hostname has mx records
   * @param {string} value 
   */
  static hasMxRecords(value) {
    const emailHostname = ValidatorGuard.decodeAndEscape(value).split('@')[1];
    return new Promise((resolve, reject) => {
      dns.resolveMx(emailHostname, (err, mxRecords) => {
        if(err || !Boolean(mxRecords.length)) {
          reject(new Error('The email address do not exists or is temporary unavailable'))
        }
        resolve(true);
      });
    });
  }

  /**
   * Check if the username is unique
   * @param {string} value 
   */
  static isUniqueUsername(value) {
    const username = ValidatorGuard.decodeAndEscape(value);
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
  }

  /**
   * Check if the id exists
   * @param {number} value 
   */
  static idExist(value) {
    return new Promise((resolve, reject) => {
      const id = parseInt(ValidatorGuard.decodeAndEscape(value), 10);
      User.get({field: 'id', value: id}, (err, user) => {
        if(err) {
          console.log(err);
          reject(new Error('Server error, please try again'));
        }
        if(!Boolean(user)) {
          reject(new Error('No users with this id'));
        }
        resolve(true);
      });
    });
  }
}

module.exports = ValidatorGuard;