const express = require('express');
const bodyParser = require('body-parser');

const funcs = require('../functions');
const v = require('../values');

const entryRouter = express.Router();
entryRouter.use(bodyParser.json());

entryRouter
  .route(`/`)
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .patch((req, res) => {
    funcs.agents.update(req, res);
  });

entryRouter
  .route(`/:${v.fields.agents.fields.recordId.api}`)
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .get((req, res) => {
    funcs.agents.get(req, res);
  });

module.exports = entryRouter;
