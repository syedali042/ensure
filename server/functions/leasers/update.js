const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');

const errorsFuncs = require('../errors');
const v = require('../../values');

const f = v.fields;
const leasersF = f.leasers.fields;

const schema = Joi.object({
  [leasersF.recordId.api]: Joi.string().required(),

  [leasersF.name.api]: Joi.string().trim().disallow(''),
  [leasersF.email.api]: Joi.string().trim().disallow(''),
  [leasersF.policyNumber.api]: Joi.string().trim().disallow(''),

  [leasersF.roadAssistance.api]: Joi.string().uri().disallow(''),
  [leasersF.logo.api]: Joi.string().uri().disallow(''),

  [leasersF.forbidAccess.api]: Joi.number().valid(0, 1),
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
  updateLeaser(req, res);
};

const updateLeaser = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.body};

    const getLeaserRes = await utilAirtable.get.records(
      f.leasers.table,
      1,
      undefined,
      `{${leasersF.recordId.db}} = "${obj[leasersF.recordId.api]}"`
    );

    if (!getLeaserRes.success) throw 'internal';
    if (getLeaserRes.body.length === 0) throw 'leaserNotFound';

    const record = getLeaserRes.body[0];
    const recordId = record.id;
    const recordArr = [
      {
        id: recordId,
        fields: await buildFields(obj),
      },
    ];

    const updateLeaserRes = await utilAirtable.update.records(
      f.leasers.table,
      recordArr
    );

    if (updateLeaserRes.success) {
      const record = updateLeaserRes.body[0];
      return res.status(200).send({
        code: 200,
        [leasersF.recordId.api]: record.id,
        message: `Leaser updated successfully`,
      });
    } else {
      throw 'internal';
    }
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};

const buildFields = async (obj) => {
  let fields = {
    [leasersF.name.db]: obj[leasersF.name.api],
    [leasersF.email.db]: obj[leasersF.email.api],
    [leasersF.policyNumber.db]: obj[leasersF.policyNumber.api],

    [leasersF.roadAssistance.db]: obj[leasersF.roadAssistance.api]
      ? [{url: obj[leasersF.roadAssistance.api]}]
      : null,
    [leasersF.logo.db]: obj[leasersF.logo.api]
      ? [{url: obj[leasersF.logo.api]}]
      : null,
    [leasersF.forbidAccess.db]:
      obj[leasersF.forbidAccess.api] == '1'
        ? true
        : obj[leasersF.forbidAccess.api] == '0'
        ? false
        : undefined,
  };

  return await cleanFields(fields);
};

const cleanFields = async (obj) => {
  for (let key in obj) {
    if (obj[key] === undefined || Number.isNaN(obj[key]) || obj[key] === null) {
      delete obj[key];
    }
  }

  return obj;
};
