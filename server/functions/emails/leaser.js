const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');
const utilGeneral = require('util992/functions/general');
const sgMail = require('@sendgrid/mail');

const errorsFuncs = require('../errors');
const v = require('../../values');

const leasersF = v.fields.leasers.fields;
const agentsF = v.fields.agents.fields;
const authF = v.fields.auth.fields;

const schema = Joi.object({
  recordId: Joi.string().trim().disallow('').required(),
  [authF.type.api]: Joi.string()
    .disallow('')
    .valid(authF.leaserType.value)
    .required(),
}).options({abortEarly: false});

module.exports = async (req, res) => {
  const validateBody = await schema.validate(req.params);

  if (validateBody.error) {
    const errorsObjects = validateBody.error.details;
    let messages = [];

    for (let i in errorsObjects) {
      const error = errorsObjects[i];
      messages.push(error.message);
    }
    return res
      .status(400)
      .send(errorsFuncs.buildError(400, messages.join(', ')));
  }

  req.params = validateBody.value;
  sendEmail(req, res);
};

const sendEmail = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.params};

    const formula = `{${leasersF.recordId.db}} = "${obj.recordId}"`;

    const leaserRes = await utilAirtable.get.records(
      v.fields.leasers.table,
      undefined,
      undefined,
      formula
    );

    if (leaserRes.success) {
      const leaser = leaserRes.body[0];
      const leaserAirtableF = leaser.fields;

      const agentsRes = await utilAirtable.get.records(
        v.fields.agents.table,
        undefined,
        undefined,
        `{${agentsF.recordId.db}} = "${
          leaserAirtableF[leasersF.agentRecordId.db][0]
        }"`
      );
      const agent = agentsRes.body[0];
      const agentAirtableF = agent.fields;

      const fieldsForTemplate = {
        clientId: leaserAirtableF[leasersF.recordId.db],
        clientSecret: leaserAirtableF[leasersF.secret.db],
        leaserName: leaserAirtableF[leasersF.name.db],
        leaserEmail: leaserAirtableF[leasersF.email.db],
        agentName: agentAirtableF[agentsF.name.db],
        agentEmail: agentAirtableF[agentsF.email.db],
        agentLogo: agentAirtableF[agentsF.logo.db]
          ? agentAirtableF[agentsF.logo.db][0].url
          : '',

        year: new Date().getFullYear(),
      };
      fieldsForTemplate.emailSubject = `Konto oprettet af ${fieldsForTemplate.agentName}`;

      const msg = {
        to: [
          {
            email: fieldsForTemplate.leaserEmail,
            name: fieldsForTemplate.leaserName,
          },
        ],
        from: {
          email: v.sendGrid.sendingEmailAddress,
          name: v.sendGrid.sendingName,
        },
        templateId: v.sendGrid.leaserEmailTemplateId,
        dynamicTemplateData: fieldsForTemplate,
      };

      let sendEmailError = null;
      await sgMail.send(msg).catch((err) => {
        console.log('couldNotSendEmail');
        console.dir(err, {depth: null});
        sendEmailError = err;
      });

      if (!sendEmailError) {
        console.log('Email sent successfully');
        return res.status(200).send({
          code: 200,
          message: 'Email sent successfully',
        });
      }
      throw 'couldNotSendEmail';
    } else {
      throw 'internal';
    }
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};
