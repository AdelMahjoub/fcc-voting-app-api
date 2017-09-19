const express = require('express');

const usersApi = express.Router();

/**
 * Endpoints controllers
 */
const getAllUsers = require('./controllers/users/getAllUsers');
const addUsers = require('./controllers/users/addUsers');
const getUsers = require('./controllers/users/getUsers');
const deleteUsers = require('./controllers/users/deleteUsers');

/**
 * request body/params/querystring validator
 */
const ValidatorGuard = require('./class/ValidatorGuard');

usersApi
  .route('/api/users')
  .get(getAllUsers.exec)
  .post(
    [
      ValidatorGuard.sanitizeBody,
      ValidatorGuard.checkEmail(),
      ValidatorGuard.checkUsername(),
      ValidatorGuard.checkPassword()
    ],
    ValidatorGuard.collectErrors,
    addUsers.exec
  )

usersApi
  .route('/api/users/confirm')
  .post((req, res, next) => {
    res.json({desc: 'confirm user registration', scope: 'public'});
  })

usersApi
  .route('/api/users/authenticate')
  .post((req, res ,next) => {
    res.json({desc: 'authenticate a registred user', scope: 'public'});
  })

const User = require('../models/user.model');
const ApiResponse = require('./class/ApiResponse');


/**
 * Todo:
 * Plug an AuthGuard middleware
 * 
 */
usersApi
  .route('/api/users/:id')
  .all(
    // Todo: add Login required here (loginRequired)
    ValidatorGuard.sanitizeIds,
    [ValidatorGuard.checkUserId()],
    // Todo: check params id and authenticated user id, (authenticIdRequired)
    // If not then the user is changing the request id param => alert
    ValidatorGuard.collectErrors
  )
  .get(getUsers.exec)
  .patch(
    [
      ValidatorGuard.sanitizeBody,
      ValidatorGuard.checkEmail({optional: true}),
      ValidatorGuard.checkUsername({optional: true}),
      ValidatorGuard.checkPassword({optional: true}),
      ValidatorGuard.passwordHasChanged()
    ],
    ValidatorGuard.collectErrors,
    (req, res, next) => {
      // request body and request id param are already sanitized at this point
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
  )
  .delete(deleteUsers.exec)

module.exports = usersApi;
