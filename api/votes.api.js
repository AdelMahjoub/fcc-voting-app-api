const express = require('express');

const votesApi = express.Router();

votesApi
  .route('/api/votes')
  .get((req, res, next) => {
    res.json({desc: 'return all votes', scope: 'admins only'});
  })

votesApi
  .route('/api/votes/users/:userId')
  .get((req, res, next) => {
    res.json({desc: 'get all votes of a user', scope: 'concerned auth user and admins'});
  })
  .delete((req, res, next) => {
    res.json({desc: 'retract all votes', scope: 'concerned auth user and admins'});
  })

votesApi
  .route('/api/votes/users/:userId/polls/:pollId')
  .get((req, res, next) => {
    res.json({desc: 'return the voted option', scope: 'concerned auth user and admins'})
  })
  .delete((req, res, next) => {
    res.json({desc: 'retract a vote', scope: 'concerned auth user and admins'});
  })

votesApi
  .route('/api/votes/users/:userId/polls/:pollId/options/:optionId')
  .post((req, res, next) => {
    res.json({desc: 'vote in a poll', scope: 'auth users and admins'});
  })

module.exports = votesApi;
