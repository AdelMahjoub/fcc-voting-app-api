const express = require('express');

const api = express.Router();
const usersApi = require('./users.api');
const pollsApi = require('./polls.api');
const votesApi = require('./votes.api');

api
  .use(usersApi)
  .use(pollsApi)
  .use(votesApi)
  
module.exports = api;