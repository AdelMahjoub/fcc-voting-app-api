const express = require('express');

const usersApi = express.Router();

// users api controller
const UserController = require('./controllers/UserController');

// Validate and sanitize request body/params/querystring
const ValidatorGuard = require('./class/ValidatorGuard');

usersApi
  .route('/api/users')
  .get(UserController.getAllUsers)
  .post(
    [
      ValidatorGuard.sanitizeBody,
      ValidatorGuard.checkEmail(),
      ValidatorGuard.checkUsername(),
      ValidatorGuard.checkPassword()
    ],
    ValidatorGuard.collectErrors,
    UserController.addUser
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
  .get(UserController.getUserById)
  .patch(
    [
      ValidatorGuard.sanitizeBody,
      ValidatorGuard.checkEmail({optional: true}),
      ValidatorGuard.checkUsername({optional: true}),
      ValidatorGuard.checkPassword({optional: true}),
      ValidatorGuard.passwordHasChanged()
    ],
    ValidatorGuard.collectErrors,
    UserController.updateUser
  )
  .delete(UserController.deleteUser)

module.exports = usersApi;
