require('dotenv').config();

const productionLink = 'ensure-leasing.herokuapp.com';
const stagingLink = 'ensure-leasing-staging.herokuapp.com';
const devLink = '909d-111-119-187-42.in.ngrok.io';

// Host URL
module.exports.hostURL = () => {
  if (process.env.MODE == 'production') {
    return `https://${productionLink}`;
  } else if (process.env.MODE == 'staging') {
    return `https://${stagingLink}`;
  } else {
    return `https://${devLink}`;
  }
};

module.exports.hostURLNonSecure = () => {
  if (process.env.MODE == 'production') {
    return `http://${productionLink}`;
  } else if (process.env.MODE == 'staging') {
    return `http://${stagingLink}`;
  } else {
    return `http://${devLink}`;
  }
};

module.exports.hostURLWithoutProtocol = () => {
  if (process.env.MODE == 'production') {
    return `${productionLink}`;
  } else if (process.env.MODE == 'staging') {
    return `${stagingLink}`;
  } else {
    return `${devLink}`;
  }
};

module.exports.generateTokenEndpoint = `/api/auth/token`;

module.exports.emailTypes = {
  newEntry: 'new-entry',
  updateEntry: 'update-entry',
  deleteEntry: 'delete-entry',
  newLeaser: 'new-leaser',
};
