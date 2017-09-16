const express = require('express');

const usersApi = express.Router();

usersApi
  .route('/api/users')
  .get((req, res, next) => {
    res.json({desc: 'return all users', scope: 'admins only'});
  })
  .post((req, res, next) => {
    res.json({desc: 'add a user', scope: 'public'});
  })

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
