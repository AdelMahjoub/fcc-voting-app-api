
const express = require('express');

const api = express.Router();

const usersApi = require('./users.api'); // Handle /api/users/* routes
const pollsApi = require('./polls.api'); // Handle /api/polls/* routes
const votesApi = require('./votes.api'); // Handle /api/votes/* routes

api
  .use(usersApi)
  .use(pollsApi)
  .use(votesApi)
  
module.exports = api;