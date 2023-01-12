const express = require('express');
const bodyParser = require('body-parser');
const utilAirtable = require('util992/functions/airtable');

const funcs = require('../functions');
const v = require('../values');

const f = v.fields;
const authF = f.auth.fields;
const agentsF = f.agents.fields;

const authRouter = express.Router();
authRouter.use(bodyParser.json());

authRouter
  .route('/')
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .post(async (req, res) => {
    handleLogin(req, res);
  });

// TODO: add body validation for login, will be different validation schema for leaser and for agent

const handleLogin = async (req, res) => {
  try {
    if (req.body[authF.type.api] === authF.leaserType.value)
      await generateAuthToken(req, res);
    else if (req.body[authF.type.api] === authF.agentType.value) {
      // TODO: generate the JWT token based on email and password, no need to generate id and secret first
      await prepareAgentLoginRequest(req, res);
      await generateAuthToken(req, res);
    }
  } catch (err) {
    const error = funcs.errors.getError(err, 'internal');
    res.status(error.code).send(error);
  }
};

const generateAuthToken = async (req, res) => {
  try {
    const jwtToken = await funcs.auth.generateJWT(
      req.body[authF.clientId.api],
      req.body[authF.clientSecret.api],
      req.body[authF.type.api]
    );

    res.status(201).send({
      [authF.accessToken.api]: jwtToken,
      [authF.expiresAt.api]: v.time.generateJWTExpiryUnix(),
    });
  } catch (err) {
    throw err;
  }
};

const prepareAgentLoginRequest = async (req) => {
  const {
    [agentsF.email.api]: email,
    [agentsF.password.api]: password,
    [authF.type.api]: type,
  } = req.body;
  const agentsRes = await utilAirtable.get.records(
    f.agents.table,
    undefined,
    undefined,
    `AND(LOWER({${agentsF.email.db}}) = "${email.toLowerCase()}", {${
      agentsF.password.db
    }} = "${password}")`
  );

  if (!agentsRes.success) throw 'internal';

  const agents = agentsRes.body;
  if (agents.length > 1) throw 'multipleAgents';
  if (agents.length === 0) throw 'noUserFound';

  const agent = agents[0];
  const client_id = agent.id;
  const client_secret = agent.fields[agentsF.password.db];
  req.body = {
    [authF.clientId.api]: client_id,
    [authF.clientSecret.api]: client_secret,
    [authF.type.api]: type,
  };
};
module.exports = authRouter;
