const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');

const errorsFuncs = require('../errors');
const v = require('../../values');

const f = v.fields;
const agentsF = f.agents.fields;

const schema = Joi.object({
  [agentsF.recordId.api]: Joi.string().trim().disallow('').required(),
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
  getAgent(req, res);
};

const getAgent = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.params};

    const checkPreviousEntriesRes = await utilAirtable.get.records(
      f.agents.table,
      undefined,
      undefined,
      `{${agentsF.recordId.db}} = "${obj[agentsF.recordId.api]}"`
    );

    if (checkPreviousEntriesRes.body.length === 0) {
      throw 'agentNotFound';
    }

    const record = checkPreviousEntriesRes.body[0];
    const recordF = record.fields;

    const pictureField = recordF[agentsF.picture.db];
    const logoField = recordF[agentsF.logo.db];
    const insuranceTermsField = recordF[agentsF.insuranceTerms.db];
    const agentFields = {
      [agentsF.recordId.api]: record.id,
      [agentsF.name.api]: recordF[agentsF.name.db],
      [agentsF.email.api]: recordF[agentsF.email.db],
      [agentsF.picture.api]: pictureField ? pictureField[0].url : undefined,
      [agentsF.logo.api]: logoField ? logoField[0].url : undefined,
      [agentsF.insuranceTerms.api]: insuranceTermsField
        ? insuranceTermsField[0].url
        : undefined,
      [agentsF.insuranceCompanyEmail.api]:
        recordF[agentsF.insuranceCompanyEmail.db],
      [agentsF.entriesViewId.api]: recordF[agentsF.entriesViewId.db],
      [agentsF.terms.api]: recordF[agentsF.terms.db]
        ? recordF[agentsF.terms.db]
        : '',
      [agentsF.guidance.api]: recordF[agentsF.guidance.db]
        ? recordF[agentsF.guidance.db]
        : '',
      [agentsF.protector.api]: recordF[agentsF.protector.db]
        ? recordF[agentsF.protector.db]
        : '',
      [agentsF.remark.api]: recordF[agentsF.remark.db]
        ? recordF[agentsF.remark.db]
        : '',
      [agentsF.areCodesActive.api]: recordF[agentsF.areCodesActive.db],
    };

    return res.status(200).send({
      code: 200,
      message: 'Agent retrieved successfully',
      agent: agentFields,
    });
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};
