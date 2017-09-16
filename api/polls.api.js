const express = require('express');

const pollsApi = express.Router();

pollsApi
  .route('/api/polls')
  .get((req, res, next) => {
    res.json({desc: 'return all polls', scope: 'public'});
  })
  .post((req, res, next) => {
    res.json({desc: 'add a poll', scope: 'auth users and admins'});
  })

pollsApi
  .route('/api/polls/:id')
  .get((req, res, next) => {
    res.json({desc: 'get a poll by id', scope: 'public'});
  })
  .patch((req, res, next) => {
    res.json({desc: 'update a poll', scope: 'auth users and admins'});
  })
  .delete((req, res, next) => {
    res.json({desc: 'delete a poll by id', scope: 'auth users and admins'});
  })

module.exports = pollsApi;