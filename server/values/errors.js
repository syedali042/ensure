const stringsValues = require('./strings');

module.exports.internal = {
  code: 500,
  message: stringsValues.errors.internal,
};

module.exports.deniedAccess = {
  code: 401,
  message: stringsValues.errors.deniedAccess,
};

module.exports.noUserFound = {
  code: 404,
  message: stringsValues.errors.noUserFound,
};

module.exports.bearerTokenNotPassed = {
  code: 401,
  message: stringsValues.errors.bearerTokenNotPassed,
};

module.exports.authHeaderNotRecognized = {
  code: 400,
  message: stringsValues.errors.authHeaderNotRecognized,
};

module.exports.needTokenRefresh = {
  code: 401,
  message: stringsValues.errors.needTokenRefresh,
};

module.exports.unauthorized = {
  code: 401,
  message: stringsValues.errors.unauthorized,
};

module.exports.twoEntriesSamePartnerReference = {
  code: 400,
  message: stringsValues.errors.twoEntriesSamePartnerReference,
};

module.exports.twoLeasersSameEmail = {
  code: 400,
  message: stringsValues.errors.twoLeasersSameEmail,
};

module.exports.entryNotFound = {
  code: 404,
  message: stringsValues.errors.entryNotFound,
};

module.exports.agentNotFound = {
  code: 404,
  message: stringsValues.errors.agentNotFound,
};

module.exports.leaserNotFound = {
  code: 404,
  message: stringsValues.errors.leaserNotFound,
};

module.exports.accountTypeAccessNotAllowed = {
  code: 403,
  message: stringsValues.errors.accountTypeAccessNotAllowed,
};

module.exports.multipleAgents = {
  code: 409,
  message: stringsValues.errors.multipleAgents,
};

module.exports.couldNotSendEmail = {
  code: 409,
  message: stringsValues.errors.couldNotSendEmail,
};
