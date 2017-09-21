const express = require('express');

const pollsApi = express.Router();

const Poll = require('../models/poll.model');
const ValidatorGuard = require('./class/ValidatorGuard');
const AuthGuard = require('./class/AuthGuard');
const ApiResponse = require('./class/ApiResponse');

pollsApi
  .route('/polls')
  .get((req, res, next) => {
    Poll.all((err, results) => {
      if(err) {
        return next(err);
      }
      return res.json(new ApiResponse({
        req,
        success: true,
        data: results
      }));
    });
  })
  .post(
    AuthGuard.tokenRequired, 
    ValidatorGuard.sanitizeBody,
    ValidatorGuard.filterBody(['title', 'options']),
    [
      ValidatorGuard.fieldRequired('title'),
      ValidatorGuard.fieldRequired('options')
    ],
    ValidatorGuard.collectErrors,
    (req, res, next) => {
      // After sanityzing the request body, the options array posted by the user is converted to a string,
      // Let's convert it back to an array
      const options = req.body.options.split(',');
      Poll.create(req.user.id, req.body.title, options, (err, results) => {
        if(err) {
          console.log(err);
          return next(err);
        }
        return res.json(new ApiResponse({
          req,
          success: true,
          data: results
        }));
      });
    });

pollsApi
  .route('/polls/:id')
  .get((req, res, next) => {
    res.json({desc: 'get a poll by id', scope: 'public'});
  })
  .patch((req, res, next) => {
    res.json({desc: 'update a poll', scope: 'auth users and admins'});
  })
  .delete((req, res, next) => {
    res.json({desc: 'delete a poll by id', scope: 'auth users and admins'});
  })

pollsApi
  .route('/polls/users/:id')
  .get((req, res, next) => {
    res.json({desc: 'get a user polls', scope: 'public'});
  })

module.exports = pollsApi;