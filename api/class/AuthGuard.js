const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const ApiResponse = require('./ApiResponse');

class AuthGuard {

  /**
   * Check the 'authorization' header for Bearer jwt
   * Verify the token authenticity to get the user id
   * call next(error) if token absent or not valid 
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static tokenRequired(req, res, next) {
    if(req.headers['authorization'] && req.headers['authorization'].split(' ')[0] === 'Bearer') {
      const token = req.headers['authorization'].split(' ')[1];
      const claimedAud = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : '127.0.0.1';
      jwt.verify(token, process.env.JWT_SECRET, {audience: claimedAud, issuer: process.env.APP_NAME}, (err, decoded) => {
        if(err) {
          err.status = 401;
          return next(err);
        }
        const id = decoded['id'];
        User.get({field: 'id', value: id}, (err, user) => {
          if(err) {
            return next(new Error('Server error, please trye again'));
          }
          if(!Boolean(user)) {
            return next(new Error('Unauthorized'));
          }
          req.user = user;
          return next();
        });
      });
    } else {
      const err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    }
  }

  /**
   * Use credentials from request body to authenticate the user
   * Send back a json web token if credentials are valid
   * @param {Requset} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static authenticate(req, res, next) {
    User.getByEmailOrUsername(req.body.identifier, (err, user) => {
      if(err) {
        console.log(err);
        return next(new Error('Server error, please try again'));
      }
      if(!Boolean(user)) {
        return res.json(new ApiResponse({
          req,
          success: false,
          errors: ['Invalid identifier or password'],
          status: 204
        }));
      }
      User.comparePasswords(req.body.password, user.password, (err, isMatch) => {
        if(err) {
          console.log(err);
          return next(new Error('Server error, please try again'));
        }
        if(!isMatch) {
          return res.json(new ApiResponse({
            req,
            success: false,
            errors: ['Invalid identifier or password'],
            status: 204
          }));
        }
        if(!Boolean(user.confirmed)) {
          return res.json(new ApiResponse({
            req,
            success: false,
            errors: ['Account not activated, please confirm your account first, check your inbox for an activation token'],
            status: 204
          }));
        }
        const aud = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : '127.0.0.1';
        const iss = process.env.APP_NAME;
        jwt.sign({id: user.id}, process.env.JWT_SECRET, {
          expiresIn: "2days",
          audience: aud,
          issuer: iss
        }, (err, token) => {
          if(err) {
            console.log(err);
            return next(new Error('Server error, please try again'));
          }
          return res.json(new ApiResponse({
            req,
            success: true,
            data: { token }
          }));
        });
      });
    });
  }

  /**
   * Authorize only admin users
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static adminRequired(req, res, next) {
    if(!Boolean(req.user['isAdmin'])) {
      const err = new Error('Unauthorized');
      err.status = 401;
      return next(err)
    }
    return next();
  }

  /**
   * Forbid authenticated users action if they change the request id param
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static authenticIdRequired(req, res, next) {
    if(parseInt(req.user.id, 10) !== parseInt(req.params.id, 10)) {
      return res.json(new ApiResponse({
        req,
        success: false,
        errors: ['Forbidden action'],
        status: 403
      }));
    }
    return next();
  }
}

module.exports = AuthGuard;