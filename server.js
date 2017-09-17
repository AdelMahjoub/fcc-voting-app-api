require('dotenv').config();
require('./db/tables')();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();
const api = require('./api');

app
  .set('port', process.env.PORT || 3000)
  .set('json spaces', 2)
  .enable('trust proxy')
  .use(helmet())
  .use(bodyParser.json())
  .use(api)
  .listen(app.get('port'), () =>{
    console.log(`Server running\nPort: ${app.get('port')}\nMode: ${app.get('env')}`);
  });
 
module.exports = app;