const express = require('express');
const bodyParser = require('body-parser');

const funcs = require('../functions');

const leaserRouter = express.Router();
leaserRouter.use(bodyParser.json());

leaserRouter
  .route('/')
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .post((req, res) => {
    funcs.leasers.add(req, res);
  })
  .patch((req, res) => {
    funcs.leasers.update(req, res);
  });

leaserRouter
  .route('/all')
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .get((req, res) => {
    funcs.leasers.get.all(req, res);
  });

module.exports = leaserRouter;
