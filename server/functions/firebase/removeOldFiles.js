const admin = require('./index');

module.exports = async () => {
  try {
    const bucket = admin.storage().bucket();

    const [files] = await bucket.getFiles();

    files.forEach((file) => {
      const daysDifference = getDifferenceFromNow(
        file.metadata.generation / 1000 // divide by 1000 to get timestamp in milliseconds as Google save in microseconds
      );
      if (daysDifference >= 1) {
        bucket.file(file.name).delete();
      }
    });
  } catch (err) {
    throw err;
  }
};

const getDifferenceFromNow = (timestamp) => {
  const difference = Date.now() - timestamp;
  const daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);

  return daysDifference;
};
