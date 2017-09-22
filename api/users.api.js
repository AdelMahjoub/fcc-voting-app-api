const express = require('express');

const usersApi = express.Router();

// users api controller
const UserController = require('./controllers/UserController');

// Validate and sanitize request body/params/querystring
const ValidatorGuard = require('./class/ValidatorGuard');

// Authenticate users and protected routes
const AuthGuard = require('./class/AuthGuard');

/**
 * GET : /api/users: admins only: get all users
 * POST: /api/users: public: add a user
 * Request body: { username, email, password }
 */
usersApi
  .route('/users')
  .get(
    AuthGuard.tokenRequired,
    AuthGuard.adminRequired,
    UserController.all
  )
  .post(
    ValidatorGuard.sanitizeBody,
    ValidatorGuard.filterBody(['email', 'username', 'password']),
    [
      ValidatorGuard.checkEmail(),
      ValidatorGuard.checkUsername(),
      ValidatorGuard.checkPassword()
    ],
    ValidatorGuard.collectErrors,
    UserController.add
  )

  /**
   * POST: /api/users/confirm: public: confirm a user account
   * Request body { identifier: (username or email), password, confirmToken(from user inbox) }
   */
usersApi
  .route('/users/confirm')
  .post(
    ValidatorGuard.sanitizeBody,
    ValidatorGuard.filterBody(['identifier', 'password', 'confirmToken']),
    [
      ValidatorGuard.fieldRequired('identifier'),
      ValidatorGuard.fieldRequired('password'),
      ValidatorGuard.fieldRequired('confirmToken')
    ],
    ValidatorGuard.collectErrors,
    UserController.confirm
  )

/**
 * POST: /api/users/authenticate: public: authenticate(login) a user
 * Request body { identifier: (username or email), password }
 */
usersApi
  .route('/users/authenticate')
  .post(
    ValidatorGuard.sanitizeBody,
    ValidatorGuard.filterBody(['identifier', 'password']),
    [
      ValidatorGuard.fieldRequired('identifier'),
      ValidatorGuard.fieldRequired('password')
    ],
    ValidatorGuard.collectErrors,
    AuthGuard.authenticate
  )

/**
 * All   : /api/users/:id all routes protected, authentication required, params id not touched required 
 * GET   : get the authenticated user by id
 * PATCH : update the authenticated user
 * DELETE: delete the authenticated user, only admins
 */
usersApi
  .route('/users/:id')
  .all(
    AuthGuard.tokenRequired,
    ValidatorGuard.sanitizeIds,
    AuthGuard.authenticIdRequired,
    [ValidatorGuard.checkUserId()],
    ValidatorGuard.collectErrors
  )
  .get(UserController.get('id'))
  .patch(
    ValidatorGuard.sanitizeBody,
    ValidatorGuard.filterBody(['username', 'email', 'password']),
    [
      ValidatorGuard.checkEmail({optional: true}),
      ValidatorGuard.checkUsername({optional: true}),
      ValidatorGuard.checkPassword({optional: true}),
      ValidatorGuard.passwordHasChanged()
    ],
    ValidatorGuard.collectErrors,
    UserController.update
  )
  .delete(
    AuthGuard.adminRequired,
    UserController.delete
  )

module.exports = usersApi;
