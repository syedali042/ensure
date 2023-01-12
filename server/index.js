const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const utilConfig = require('util992/config');
const cors = require('cors');
const enforce = require('express-sslify');
const sgMail = require('@sendgrid/mail');

require('dotenv').config();

const auth = require('./middleware/auth');
const forbidNonLeaser = require('./middleware/forbidNonLeasers');
const forbidNonAgent = require('./middleware/forbidNonAgents');
const forbidNonAgentsNonLeasers = require('./middleware/forbidNonAgentsNonLeasers');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const funcs = require('./functions');
const v = require('./values');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

if (process.env.MODE !== `dev`) {
  console.log(`Running in production mode`);

  // Use enforce.HTTPS({ trustProtoHeader: true }) in case you are behind
  // a load balancer (e.g. Heroku). See further comments below
  app.use(enforce.HTTPS({trustProtoHeader: true}));

  // funcs.cron.setupAwakeJob(10); // No neeed to run this in production since app is paid
  funcs.cron.setupRemoveFilesAfterADayJob();
}

utilConfig.g.hitInHouseEndpointBaseURL(v.dev.hostURL());
utilConfig.airtable.baseId(process.env.AIRTABLE_BASE_ID);
utilConfig.airtable.apiKey(process.env.AIRTABLE_API_KEY);

const helpersRouter = require('./routers/helpersRouter');
app.use('/helper', helpersRouter);

app.get('/api-docs', (req, res) => {
  res.redirect('https://documenter.getpostman.com/view/24160662/2s8YRgqEdC');
});

const loginRouter = require('./routers/loginRouter');
app.use('/api/login', loginRouter);

const entryRouter = require('./routers/entryRouter');
app.use('/api/entries', auth, forbidNonLeaser, entryRouter);

const agentRouter = require('./routers/agentRouter');
app.use('/api/agents', auth, forbidNonAgent, agentRouter);

const leaserRouter = require('./routers/leaserRouter');
app.use('/api/leasers', auth, forbidNonAgent, leaserRouter);

const filesRouter = require('./routers/filesRouter');
app.use('/api/files', auth, forbidNonAgent, filesRouter);

const emailsRouter = require('./routers/emailsRouter');
app.use('/api/emails', emailsRouter);

const codesRouter = require('./routers/codesRouter');
app.use('/api/codes', codesRouter);

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));
// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.get('/awake', (req, res) => {
  res.json();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

if (process.env.MODE === `dev`) {
  const testOnDevelopment = async () => {
    try {
      // const playground = require('./playGround');
      try {
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.dir(err, {depth: null});
    }
  };

  testOnDevelopment();
}
