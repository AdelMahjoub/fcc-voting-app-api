const User = require('../../../models/user.model');           // User model
const ApiResponse = require('../../class/ApiResponse');       // Response format
const ValidatorGuard = require('../../class/ValidatorGuard'); // Validation handler

/**
 * Get a user by id
 * @param {Request} req 
 * @param {Response} res 
 * @param {Callback} next
 */
const exec = function(req, res, next) {
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

module.exports = { exec }