const utilGeneral = require('util992/functions/general');

const v = require('../values');

module.exports.truncateRecordId = (recordId) => {
  return recordId.substring(3);
};

module.exports.restoreRecordId = (recordId) => {
  return `rec${recordId}`;
};

module.exports.notifyError = async (message) => {
  console.log(`Error to be sent to integromat: ${message}`);
  try {
    await utilGeneral.hitURL(v.integromat.failureNotificationWebhook, 'post', {
      message,
    });
  } catch (err) {
    console.log(err);
  }
};
