
const express = require('express');

const api = express.Router();

const usersApi = require('./users.api'); // Handle /api/users/* routes
const pollsApi = require('./polls.api'); // Handle /api/polls/* routes
const votesApi = require('./votes.api'); // Handle /api/votes/* routes
const ApiResponse = require('./class/ApiResponse');

api
  .use('/api', usersApi)
  .use('/api', pollsApi)
  .use('/api', votesApi)
  .use('*', (req, res, next) => {
    const err = new Error('Bad request');
    err.status = 400;
    return next(err);
  })
  .use((err, req, res, next) => {
    res.json(new ApiResponse({
      req,
      success: false,
      errors: [err.message],
      status: err.status || 500
    }));
  });
  
module.exports = api;