const funcs = require('../functions');
const v = require('../values');

const authF = v.fields.auth.fields;

module.exports = async (req, res, next) => {
  try {
    await confirmIfAgentOrLeaser(req.jwtObj);
    next();
  } catch (err) {
    const error = funcs.errors.getError(err, 'internal');
    res.status(error.code).send(error);
  }
};

const confirmIfAgentOrLeaser = async (obj) => {
  try {
    if (
      obj.type !== authF.agentType.value &&
      obj.type !== authF.leaserType.value
    )
      throw 'accountTypeAccessNotAllowed';
    return;
  } catch (err) {
    throw err;
  }
};
