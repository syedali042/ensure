const utilGeneral = require('util992/functions/general');
const v = require('../values');

module.exports.getError = (err, fallbackError = 'internal') => {
  // If it's an error flag (string) and not an object, then this is a recognized or handled error
  // just return the error body prepared
  if (utilGeneral.isString(err)) return v.errors[err];
  // If not then it's an error that is not predicted, so just return the fallbackError
  else {
    console.dir(err, {depth: null});
    return v.errors[fallbackError];
  }
};

module.exports.buildError = (code, message) => {
  return {
    code,
    message,
  };
};
