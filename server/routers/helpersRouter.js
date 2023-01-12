const express = require('express');
const bodyParser = require('body-parser');

const v = require('../values');

const helpersRouter = express.Router();
helpersRouter.use(bodyParser.json());

helpersRouter
  .route('/values')
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .get((req, res, next) => {
    res.send(v);
  });

module.exports = helpersRouter;
