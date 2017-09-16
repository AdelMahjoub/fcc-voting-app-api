const express = require('express');

const api = express.Router();

api
  .route('/api')
  .all((req, res, next) => {
    console.log(req.headers);
    res.json({status: res.statusCode, reason: res.statusMessage})
  })

module.exports = api;