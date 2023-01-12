const express = require('express');
const bodyParser = require('body-parser');

const funcs = require('../functions');

const v = require('../values');

const authF = v.fields.auth.fields;

const emailsRouter = express.Router();
emailsRouter.use(bodyParser.json());

emailsRouter
  .route(`/:type/:recordId`)
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .post((req, res) => {
    const type = req.params.type;
    if (type === authF.entryType.value) funcs.emails.entry(req, res);
    else if (type === authF.leaserType.value) funcs.emails.leaser(req, res);
  });

module.exports = emailsRouter;
