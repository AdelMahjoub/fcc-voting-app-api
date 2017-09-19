const User = require('../../../models/user.model');           // User model
const ApiResponse = require('../../class/ApiResponse');       // Response format
const ValidatorGuard = require('../../class/ValidatorGuard'); // Validation handler

/**
 * Delete a user by id
 * @param {Request} req 
 * @param {Response} res 
 * @param {callback} next 
 */
const exec = function(req, res, next) {
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

module.exports = { exec }