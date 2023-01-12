const moment = require(`moment`);
const momentTimezone = require(`moment-timezone`);

require(`dotenv`).config();

// --------------------- TimeZone --------------------- //
module.exports.timeZoneStr = () => {
  if (process.env.MODE === `dev`) return `Europe/Copenhagen`;
  else return `Europe/Copenhagen`;
};
const now = moment().tz(this.timeZoneStr());
module.exports.timeZone = now.format(`ZZ`);
// --------------------- Time --------------------- //

module.exports.getTimeInCorrectTimeZone = (time) => {
  if (time)
    return moment(time).tz(this.timeZoneStr()).format('YYYY/MM/DD HH:mm:ss');
  else return null;
};

module.exports.generateJWTExpiryUnix = () => {
  return moment().add('1', 'day').unix();
};

module.exports.checkTokenExpired = (iat) => {
  const oneDay = 86400;
  return moment().unix() - iat > oneDay;
};
