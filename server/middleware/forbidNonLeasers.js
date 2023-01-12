const funcs = require('../functions');
const v = require('../values');

const authF = v.fields.auth.fields;

module.exports = async (req, res, next) => {
  try {
    await confirmIfLeaser(req.jwtObj);
    next();
  } catch (err) {
    const error = funcs.errors.getError(err, 'internal');
    res.status(error.code).send(error);
  }
};

const confirmIfLeaser = async (obj) => {
  try {
    if (obj.type !== authF.leaserType.value)
      throw 'accountTypeAccessNotAllowed';
    return;
  } catch (err) {
    throw err;
  }
};
