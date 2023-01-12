const {generateTokenEndpoint} = require('./development');

module.exports = {
  errors: {
    internal: `Sorry, there seems to be an internal error here, if it continues, please contact the admin to fix this.`,
    noUserFound: `This account doesn't seem to be present in our records, please confirm information or check with the admin.`,
    bearerTokenNotPassed: `You didn't pass a bearer token with your request! You can generate that through ${generateTokenEndpoint}.`,
    authHeaderNotRecognized: `We couldn't recognize the authentication header you provided! You can generate a bearer token that through ${generateTokenEndpoint}.`,
    unauthorized: `You are unauthorized to perform this request!`,
    deniedAccess:
      'You were denied access, please contact the admin for more detail.',
    needTokenRefresh: `Your token isn't valid anymore but you can still generate a new token through ${generateTokenEndpoint}.`,
    twoEntriesSamePartnerReference:
      'An Entry with this partner reference already exist, please provide a unique partner reference.',
    twoLeasersSameEmail:
      'A Leaser with this email already exist, please provide a unique email.',
    entryNotFound: `The entry you are looking for doesn't exist.`,
    agentNotFound: `The agent you are looking for doesn't exist.`,
    leaserNotFound: `The leaser you are looking for doesn't exist.`,
    accountTypeAccessNotAllowed: `Your account type doesn't allowing access to this endpoint`,
    multipleAgents: `Sorry, but seems there are multiple accounts with this user name, please contact admin to solve the issue.`,
    couldNotSendEmail: `Sorry, we couldn't send the email, please try again later.`,
  },
};
