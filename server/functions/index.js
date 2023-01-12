const agents = require('./agents');
const emails = require('./emails');
const entries = require('./entries');
const files = require('./files');
const leasers = require('./leasers');
const auth = require('./auth');
const cron = require('./cron');
const errors = require('./errors');
const general = require('./general');
const codes = require('./codes');

module.exports = {
  agents,
  emails,
  entries,
  files,
  leasers,
  auth,
  cron,
  errors,
  general,
  codes,
};
