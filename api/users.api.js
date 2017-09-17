const express = require('express');

const { check, validationResult } = require('express-validator/check'); // remove after all controllers are written
const validator = require('validator'); // remove after all controllers are written

const usersApi = express.Router();

const User = require('../models/user.model');      // remove after all controllers are written
const ApiResponse = require('./class/ApiResponse');// remove after all controllers are written

/**
 * Endpoints controllers
 */
const getAllUsers = require('./controllers/users/getAllUsers');
const addUsers = require('./controllers/users/addUsers');

usersApi
  .route('/api/users')
  .get(getAllUsers.exec)
  .post(
    addUsers.validate,
    addUsers.collectErrors,
    addUsers.exec
  )

usersApi
  .route('/api/users/confirm')
  .post((req, res, next) => {
    res.json({desc: 'confirm user registration', scope: 'public'});
  })

usersApi
  .route('/api/users/authenticate')
  .post((req, res ,next) => {
    res.json({desc: 'authenticate a registred user', scope: 'public'});
  })

usersApi
  .route('/api/users/:id')
  .get((req, res, next) => {
    res.json({desc: 'get a user by id', scope: 'auth users and admins'});
  })
  .patch((req, res, next) => {
    res.json({desc: 'update a user', scope: 'auth users and admins'});
  })
  .delete((req, res, next) => {
    res.json({desc: 'delete a user by id', scope: 'admins only'});
  })

module.exports = usersApi;
