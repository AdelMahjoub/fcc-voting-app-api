const express = require('express');

const pollsApi = express.Router();

const PollController = require('./controllers/PollController');
const ValidatorGuard = require('./class/ValidatorGuard');
const AuthGuard = require('./class/AuthGuard');

pollsApi
  .route('/polls')
  .get(PollController.all)
  .post(
    AuthGuard.tokenRequired, 
    ValidatorGuard.sanitizeBody,
    ValidatorGuard.filterBody(['title', 'options']),
    [
      ValidatorGuard.fieldRequired('title'),
      ValidatorGuard.fieldRequired('options')
    ],
    ValidatorGuard.collectErrors,
    PollController.add
  );

pollsApi
  .route('/polls/:id')
  .all(ValidatorGuard.sanitizeIds)
  .get(PollController.get('id'))
  .patch(
    AuthGuard.tokenRequired,
    AuthGuard.authorIsUser,
    ValidatorGuard.sanitizeBody,
    ValidatorGuard.filterBody(['title', 'options']),
    [
      ValidatorGuard.fieldRequired('title'),
      ValidatorGuard.fieldRequired('options')
    ],
    ValidatorGuard.collectErrors,
    PollController.update
  )
  .delete(
    AuthGuard.tokenRequired,
    AuthGuard.authorIsUser,
    PollController.remove
  )

pollsApi
  .route('/polls/users/:id')
  .get(
    ValidatorGuard.sanitizeIds,
    PollController.get('id', 'Users')
  )

module.exports = pollsApi;