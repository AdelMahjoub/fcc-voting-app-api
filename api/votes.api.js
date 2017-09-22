const express = require('express');

const votesApi = express.Router();

votesApi
  .route('/api/votes')
  .post((req, res, next) => {
    res.json({desc: 'vote in a poll', scope: 'auth users'});
  })

votesApi
  .route('/api/votes/users/:userId')
  .get((req, res, next) => {
    res.json({desc: 'get all votes of a user', scope: 'concerned auth user and admins'});
  })

votesApi
  .route('/api/votes/users/:userId/polls/:pollId')
  .get((req, res, next) => {
    res.json({desc: 'return the voted option', scope: 'concerned auth user and admins'})
  })

module.exports = votesApi;
