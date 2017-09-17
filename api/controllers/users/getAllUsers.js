const User = require('../../../models/user.model');
const ApiResponse = require('../../class/ApiResponse');

/**
 * Execute the requested action: get all users
 * @param {Request} req 
 * @param {Response} res 
 * @param {Callback} next 
 */
const exec = function(req, res, next) {
  User.all((err, users) => {
    if(err) {
      return next(err);
    }
    return res.json(new ApiResponse({ req, success: true, data: users }));
  });
}

module.exports = { exec }