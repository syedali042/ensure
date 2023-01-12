const dev = require(`./development`);
const errors = require('./errors');
const fields = require('./fields');
const g = require(`./general.js`);
const integromat = require('./integromat');
const sendGrid = require('./sendGrid');
const strings = require('./strings');
const time = require('./time');

module.exports = {
  dev,
  errors,
  fields,
  g,
  integromat,
  sendGrid,
  strings,
  time,
};
