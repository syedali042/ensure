const express = require('express');
const bodyParser = require('body-parser');

const funcs = require('../functions');
const v = require('../values');

const codeRouter = express.Router();
codeRouter.use(bodyParser.json());

codeRouter
  .route(`/add`)
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .post((req, res) => {
    funcs.codes.add(req, res);
  });

codeRouter
  .route(`/:${v.fields.codes.fields.agent.api}`)
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .get((req, res) => {
    funcs.codes.get.all(req, res);
  });

module.exports = codeRouter;
