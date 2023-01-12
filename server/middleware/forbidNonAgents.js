const funcs = require('../functions');
const v = require('../values');

const authF = v.fields.auth.fields;

module.exports = async (req, res, next) => {
  try {
    await confirmIfAgent(req.jwtObj);
    next();
  } catch (err) {
    const error = funcs.errors.getError(err, 'internal');
    res.status(error.code).send(error);
  }
};

const confirmIfAgent = async (obj) => {
  try {
    if (obj.type !== authF.agentType.value) throw 'accountTypeAccessNotAllowed';
    return;
  } catch (err) {
    throw err;
  }
};
