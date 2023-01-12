const express = require('express');
const bodyParser = require('body-parser');

const funcs = require('../functions');

const entryRouter = express.Router();
entryRouter.use(bodyParser.json());

entryRouter
  .route('/')
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .get((req, res) => {
    funcs.entries.get(req, res);
  })
  .post((req, res) => {
    funcs.entries.add(req, res);
  })
  .patch((req, res) => {
    funcs.entries.update(req, res);
  })
  .delete((req, res) => {
    funcs.entries.remove(req, res);
  });

module.exports = entryRouter;
