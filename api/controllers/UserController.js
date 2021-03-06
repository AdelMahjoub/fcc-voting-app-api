const User = require('../../models/user.model');
const ApiResponse = require('../class/ApiResponse');
const mailer = require('../class/Mailer');
const ValidatorGuard = require('../class/ValidatorGuard');
const assert = require('assert');

class UserController {

  /**
   * Return all user in the response
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static all(req, res, next) {
    User.all((err, users) => {
      if(err) {
        return next(err);
      }
      return res.json(new ApiResponse({ req, success: true, data: users }));
    });
  }

  /**
   * return the requested user in the response
   * @param {string} field 
   */
  static get(field) {
    return function(req, res, next) {
      const id = parseInt(ValidatorGuard.decodeAndEscape(req.params.id), 10);
      User.get({field, value: id}, (err, user) => {
        if(err) {
          return next(err);
        }
        const data = Object.assign({}, user);
        delete data.password;
        delete data.confirmToken;
        return res.json(new ApiResponse({
          req,
          success: true,
          data
        }));
      });
    }
  }

  /**
   * Add a user and respond
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static add(req, res, next) {
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
            //console.log(info);
            return;
          })
          .catch(err => {
            console.log(err);
            return;
          })
      });
      // The response for a succeful user registration is sent before sending the confirmation token
      // because sending an email could be slow
      const data = Object.assign({}, results, {info: ` a confirm token has been sent to ${candidate.email}`});
      res.json(new ApiResponse({req, success: true, data }));
    });
  }

  /**
   * Delete a user and respond
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static delete(req, res, next) {
    const id = parseInt(ValidatorGuard.decodeAndEscape(req.params.id), 10);
    User.removeById(id, (err, results) => {
      if(err) {
        return next(err);
      }
      return res.json(new ApiResponse({
        req, 
        success: true,
        data: results
      }));
    });
  }

  /**
   * Update a user and respond
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static update(req, res, next) {
    // request body and request id param are already sanitized
    // keep only the concerned keys in req.body
    let properties = 0;
    Object.keys(req.body).forEach(key => {
      properties++;
    });
    //console.log(req.body)
    if(properties === 0) {
      return res.json(new ApiResponse({
        success: false,
        req,
        errors: ['Nothing to update'],
        status: 204
      }));
    }
    User.update(req.params.id, req.body, (err, results) => {
      if(err) {
        return next(err);
      }
      return res.json(new ApiResponse({
        req,
        success: true,
        data: results
      }));
    });
  }

  /**
   * Activate user account: set confirmed field to 1, and respond
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static confirm(req, res, next) {
    User.getByEmailOrUsername(req.body.identifier, (err, user) => {
      if(err) {
        return next(err);
      }
      if(!Boolean(user)) {
        return res.json(new ApiResponse({
          req,
          success: false,
          errors: ['Invalid identifier or password or confirm token'],
          status: 204
        }));
      }
      User.comparePasswords(req.body.password, user.password, (err, isMatch) => {
        if(err) {
          return next(err);
        }
        if(!isMatch) {
          return res.json(new ApiResponse({
            req,
            success: false,
            errors: ['Invalid identifier or password or confirm token'],
            status: 204
          }));
        }
        if(!(req.body.confirmToken === user.confirmToken)) {
          return res.json(new ApiResponse({
            req,
            success: false,
            errors: ['Invalid identifier or password or confirm token'],
            status: 204
          }));
        }
        if(Boolean(user.confirmed)) {
          return res.json(new ApiResponse({
            req,
            success: false,
            errors: ['Already confirmed']
          }));
        }
        User.confirm(user.id, (err, results) => {
          if(err) {
            return next(err);
          }
          mailer.sendAccountActivation(user, req)
            .then(info => {
              //console.log(info);
              return;
            })
            .catch(err => {
              console.log(err);
              return;
            })
          return res.json(new ApiResponse({
            req,
            success: true,
            data: Object.assign({}, results, {info: `A success account activation mail was sent to ${user.email}`})
          }));
        });
      });
    });
  }
}

module.exports = UserController;