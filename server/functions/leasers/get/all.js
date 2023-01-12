const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');

const errorsFuncs = require('../../errors');
const v = require('../../../values');

const f = v.fields;
const agentsF = f.agents.fields;
const leasersF = f.leasers.fields;

const schema = Joi.object({
  [agentsF.recordId.api]: Joi.string(),
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
  getLeasers(req, res);
};

const getLeasers = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.params};
    const getLeasersRes = await utilAirtable.get.records(
      f.leasers.table,
      undefined,
      undefined,
      `{${leasersF.agentRecordId.db}} = "${obj[f.auth.fields.id.api]}"`
    );

    const leasers = getLeasersRes.body;

    let message = '';
    let leasersArr = [];
    if (leasers.length === 0) {
      message = 'No leasers found.';
    } else {
      message = `${leasers.length} leasers found`;

      for (let key in leasers) {
        const leaser = leasers[key];

        //    //leasersF.roadAssistance.api][0].url

        const pdfFiles = leaser.fields[leasersF.roadAssistance.db];
        const logoFiles = leaser.fields[leasersF.logo.db];
        leasersArr.push({
          [leasersF.recordId.api]: leaser.id,
          [leasersF.name.api]: leaser.fields[leasersF.name.db],
          [leasersF.email.api]: leaser.fields[leasersF.email.db],
          [leasersF.policyNumber.api]: leaser.fields[leasersF.policyNumber.db],
          [leasersF.roadAssistance.api]: pdfFiles ? pdfFiles[0].url : undefined,
          [leasersF.logo.api]: logoFiles ? logoFiles[0].url : undefined,
          [leasersF.forbidAccess.api]: leaser.fields[leasersF.forbidAccess.db],
        });
      }
    }

    return res.status(200).send({
      code: 200,
      message,
      leasers: leasersArr,
    });
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};
