const User = require('../../models/user.model');
const ApiResponse = require('../class/ApiResponse');
const mailer = require('../class/Mailer');
const ValidatorGuard = require('../class/ValidatorGuard');

class UserController {

  /**
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static getAllUsers(req, res, next) {
    User.all((err, users) => {
      if(err) {
        return next(err);
      }
      return res.json(new ApiResponse({ req, success: true, data: users }));
    });
  }

  /**
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static getUserById(req, res, next) {
    const id = parseInt(ValidatorGuard.decodeAndEscape(req.params.id), 10);
    User.get({field: 'id', value: id}, (err, user) => {
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

  /**
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static addUser(req, res, next) {
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

  /**
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static deleteUser(req, res, next) {
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
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static updateUser(req, res, next) {
    // request body and request id param are already sanitized
    // keep only the concerned keys in req.body
    const concernedFields = ['username', 'email', 'password'];
    Object.keys(req.body).forEach(key => {
      if(!concernedFields.includes(key)) {
        delete req.body[key];
      }
    });
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

}

module.exports = UserController;