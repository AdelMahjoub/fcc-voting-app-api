// ==============================================================
// If this module is used separately => load env variables
// usually it won't be used separately in a production enviroment
// but env variables are required to test the connecton to the db
// https://github.com/motdotla/dotenv
// ==============================================================
if(!Boolean(process.env.NODE_ENV)) {
  require('dotenv').config();
}

// ==============================================================
// mysql https://github.com/mysqljs/mysql
// fs    https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
// path  https://nodejs.org/dist/latest-v6.x/docs/api/path.html
// ==============================================================
const mysql = require('mysql');
const fs    = require('fs');
const path  = require('path');

// ==============================================================
// https://github.com/mysqljs/mysql#connection-options
// ==============================================================
const options = {
  database:        process.env.NODE_ENV === 'production' ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME,  
  host:            process.env.NODE_ENV === 'production' ? process.env.PROD_DB_HOST : process.env.DEV_DB_HOST,
  port:            process.env.NODE_ENV === 'production' ? process.env.PROD_DB_PORT : process.env.DEV_DB_PORT,
  user:            process.env.NODE_ENV === 'production' ? process.env.PROD_DB_USER : process.env.DEV_DB_USER,
  password:        process.env.NODE_ENV === 'production' ? process.env.PROD_DB_PASS : process.env.DEV_DB_PASS,
  connectionLimit: process.env.DB_CONNECTIONS_LIMIT || 10,  
  dateStrings:     true,
//debug:           process.env.NODE_ENV === 'production' ? false : true,
  insecureAuth:    process.env.NODE_ENV === 'production' ? false : true,
  trace:           process.env.NODE_ENV === 'production' ? false : true
}

// ==============================================================
// Create a connection pool to the database
// ==============================================================
const dbConnectionsPool = mysql.createPool(options);

module.exports = dbConnectionsPool;
