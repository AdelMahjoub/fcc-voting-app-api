const express = require('express');
const { check, validationResult } = require('express-validator/check');

const votesApi = express.Router();

const AuthGuard = require('./class/AuthGuard');
const ValidatorGuard = require('./class/ValidatorGuard');

const VoteController = require('./controllers/VoteController');

votesApi
  .route('/votes')
  .post(
    AuthGuard.tokenRequired,
    ValidatorGuard.sanitizeBody,
    ValidatorGuard.filterBody(['pollId', 'optionId']),
    [
      ValidatorGuard.fieldRequired('pollId')
      .isNumeric()
      .withMessage('No such poll'),
      ValidatorGuard.fieldRequired('optionId')
      .isNumeric()
      .withMessage('No such option')
    ],
    ValidatorGuard.collectErrors,
    VoteController.vote
  )

votesApi
  .route('/votes/polls/:pollId')
  .get(
    AuthGuard.tokenRequired,
    ValidatorGuard.sanitizeIds,
    VoteController.myVotedOption
  )

module.exports = votesApi;
