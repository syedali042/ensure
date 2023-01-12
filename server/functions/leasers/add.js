const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');
const utilGeneral = require('util992/functions/general');
const randomString = require('random-base64-string');

const errorsFuncs = require('../errors');
const v = require('../../values');

const f = v.fields;
const leasersF = f.leasers.fields;

const schema = Joi.object({
  [leasersF.name.api]: Joi.string().trim().disallow('').required(),
  [leasersF.email.api]: Joi.string().trim().disallow('').required(),
  [leasersF.policyNumber.api]: Joi.string().trim().disallow('').required(),

  [leasersF.roadAssistance.api]: Joi.string().uri().disallow(''),
  [leasersF.logo.api]: Joi.string().uri().disallow(''),

  [leasersF.agentRecordId.api]: Joi.string().trim().disallow('').required(),
}).options({abortEarly: false});

module.exports = async (req, res) => {
  const validateBody = await schema.validate(req.body);

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

  req.body = validateBody.value;
  addLeaser(req, res);
};

const addLeaser = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.body};

    // A Leaser can have same email only if under different agents
    const checkPreviousLeasersRes = await utilAirtable.get.records(
      f.leasers.table,
      1,
      undefined,
      `AND({${leasersF.email.db}} = "${obj[leasersF.email.api]}", {${
        leasersF.agentRecordId.db
      }} = "${obj[leasersF.agentRecordId.api]}")`
    );

    if (checkPreviousLeasersRes.body.length > 0) {
      throw 'twoLeasersSameEmail';
    }

    const leaserFields = {
      [leasersF.name.db]: obj[leasersF.name.api],
      [leasersF.email.db]: obj[leasersF.email.api],
      [leasersF.policyNumber.db]: obj[leasersF.policyNumber.api],
      [leasersF.roadAssistance.db]: obj[leasersF.roadAssistance.api]
        ? [{url: obj[leasersF.roadAssistance.api]}]
        : [],
      [leasersF.logo.db]: obj[leasersF.logo.api]
        ? [{url: obj[leasersF.logo.api]}]
        : [],
      [leasersF.secret.db]: randomString(36),
      [leasersF.agent.db]: [obj[leasersF.agentRecordId.api]],
    };

    const addLeaserRes = await utilAirtable.set.records(f.leasers.table, [
      leaserFields,
    ]);

    if (addLeaserRes.success) {
      const record = addLeaserRes.body[0];
      res.status(201).send({
        code: 201,
        [leasersF.recordId.api]: record.id,
        message: `Leaser created successfully`,
      });

      const sendEmailRes = await utilGeneral.hitInHouseEndpoint(
        `/api/emails/leaser/${record.id}`,
        'post'
      );
    } else {
      throw 'internal';
    }
  } catch (err) {
    console.dir(err, {depth: null});
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};
