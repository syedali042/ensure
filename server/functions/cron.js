const CronJob = require('cron').CronJob;
const utilGeneral = require('util992/functions/general');

const removeOldFiles = require('./firebase/removeOldFiles');
require('dotenv').config();

async function createCronJob(timer, action, successMessage, failureMessage) {
  let someJob = new CronJob(timer, async function () {
    try {
      await action();
      console.log(`${successMessage} at ${Date()}`);
    } catch (err) {
      console.log(
        await utilGeneral.constructResponse(
          false,
          err.code,
          `${failureMessage} at ${Date()}`,
          err
        )
      );
    }
  });
  return someJob;
}

module.exports.setupAwakeJob = async (frequencyInMinutes) => {
  let awakeJob = await createCronJob(
    `*/${frequencyInMinutes} * * * *`,
    async () => {
      const awakeRes = await utilGeneral.hitInHouseEndpoint('/awake', 'get');
    },
    `Successfully awaken the service`,
    `Couldn't awake the service`
  );

  awakeJob.start();
};

module.exports.setupRemoveFilesAfterADayJob = async () => {
  let removeJob = await createCronJob(
    `0 0 * * *`,
    async () => {
      await removeOldFiles();
    },
    'Successfully removed files older than 1 day',
    "Couldn't remove files older than 1 day"
  );

  removeJob.start();
};
