const utilAirtable = require('util992/functions/airtable');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const v = require('../values');

const f = v.fields;
const authF = f.auth.fields;
const agentsF = f.agents.fields;
const leasersF = f.leasers.fields;

module.exports.generateJWT = async (clientId, clientSecret, type) => {
  try {
    let tableName, accountF, secretOrPassword;
    type = type.toLowerCase();

    if (type === authF.leaserType.value) {
      tableName = f.leasers.table;
      accountF = leasersF;
      secretOrPassword = 'secret';
    } else {
      tableName = f.agents.table;
      accountF = agentsF;
      secretOrPassword = 'password';
    }

    // Get all accounts from Airtable
    const accountsRecordsRes = await utilAirtable.get.records(
      tableName,
      undefined,
      undefined,
      `AND({${accountF.recordId.db}} = "${clientId}", {${accountF[secretOrPassword].db}} = "${clientSecret}")`
    );

    const accounts = accountsRecordsRes.body;

    if (accounts.length === 1) {
      const account = accounts[0];

      // Account might be not allowed anymore, so will check the forbidAccess flag
      if (account.fields[accountF.forbidAccess.db]) {
        throw 'deniedAccess';
      }

      const forbidAccessChangeTime =
        account.fields[accountF.forbidAccessChangeTime.db];

      const payload = {
        [authF.id.api]: account.fields[accountF.recordId.db],
        [authF.date.api]: forbidAccessChangeTime
          ? forbidAccessChangeTime
          : account.createdTime,
        [authF.type.api]: type,
      };

      const token = jwt.sign(payload, process.env.TOKEN_SECRET);
      return token;
    } else throw 'noUserFound';
  } catch (err) {
    throw err;
  }
};
