const Poll = require('../../models/poll.model');
const ValidatorGuard = require('../class/ValidatorGuard');
const AuthGuard = require('../class/AuthGuard');
const ApiResponse = require('../class/ApiResponse');

class PollController {

  /**
   * Return all polls in the response
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static all(req, res, next) {
    Poll.all((err, results) => {
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
   * Return the requested poll in the response
   * @param {string} field 
   */
  static get(field, scope = 'Polls') {
    return function(req, res, next) {
      Poll.get({field, value: req.params.id, scope}, (err, results) => {
        if(err) {
          return next(err);
        }
        return res.json(new ApiResponse({
          req,
          success:true,
          data: results
        }));
      });
    }
  }


  /**
   * Add a new poll and respond
   * @param {Request} req 
   * @param {Response} res 
   * @param {callback} next 
   */
  static add(req, res, next) {
    // After sanityzing the request body, the options array posted by the user is converted to a string,
    // Let's convert it back to an array
    const options = req.body.options.split(',');
    Poll.create(req.user.id, req.body.title, options, (err, results) => {
      if(err) {
        console.log(err);
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
  static remove(req, res, next) {
    Poll.remove(req.params.id, (err, results) => {
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
  static update(req, res, next) {
    Poll.remove(req.params.id, (err, results) => {
      if(err) {
        return next(err);
      }
      return PollController.add(req, res, next);
    });
  }

}

module.exports = PollController;