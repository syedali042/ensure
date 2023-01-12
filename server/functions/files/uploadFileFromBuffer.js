const admin = require('../firebase');

module.exports = async (buffer, fileName) => {
  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(fileName, {contentType: 'application/pdf'});
    await file.save(buffer);

    const returnedURL = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });
    return returnedURL[0];
  } catch (err) {
    throw err;
  }
};
