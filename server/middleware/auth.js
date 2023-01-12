const utilAirtable = require('util992/functions/airtable');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const funcs = require('../functions');
const v = require('../values');

const f = v.fields;
const authF = f.auth.fields;
const agentsF = f.agents.fields;
const leasersF = f.leasers.fields;

module.exports = async (req, res, next) => {
  try {
    const jwtToken = await verifyJWTToken(req.headers.authorization);
    req.jwtObj = jwtToken;
    next();
  } catch (err) {
    const error = funcs.errors.getError(err, 'unauthorized');
    res.status(error.code).send(error);
  }
};

const verifyJWTToken = async (authHeader) => {
  try {
    const token = await getBearerToken(authHeader);

    const obj = jwt.verify(token, process.env.TOKEN_SECRET);

    let tableName, fieldsObj;
    if (obj[authF.type.api] === authF.leaserType.value) {
      tableName = f.leasers.table;
      fieldsObj = leasersF;
    } else {
      tableName = f.agents.table;
      fieldsObj = agentsF;
    }

    const leasersRecordsRes = await utilAirtable.get.records(
      tableName,
      undefined,
      undefined,
      `{${fieldsObj.recordId.db}} = "${obj[authF.id.api]}"`
    );
    const leaser = leasersRecordsRes.body[0];
    // Leaser might be not allowed anymore, so will check the forbidAccess flag
    if (leaser.fields[fieldsObj.forbidAccess.db]) {
      throw 'deniedAccess';
    }

    const forbidAccessChangeTime =
      leaser.fields[fieldsObj.forbidAccessChangeTime.db];

    const isDateLatestVerified = forbidAccessChangeTime
      ? obj[authF.date.api] === forbidAccessChangeTime
      : obj[authF.date.api] === leaser.createdTime;

    const isExpired = v.time.checkTokenExpired(obj.iat);

    if (isDateLatestVerified && !isExpired) {
      return obj;
    } else {
      throw 'needTokenRefresh';
    }
  } catch (err) {
    throw err;
  }
};

const getBearerToken = async (authHeader) => {
  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.substring(7, authHeader.length);

    if (token.length > 0) return token;
    else throw 'bearerTokenNotPassed';
  } else throw 'authHeaderNotRecognized';
};
