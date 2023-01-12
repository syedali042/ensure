const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');

const errorsFuncs = require('../errors');
const v = require('../../values');

const f = v.fields;
const entriesF = f.entries.fields;

const schema = Joi.object({
  [entriesF.recordId.api]: Joi.string()
    .trim()
    .disallow('')
    .required()
    .when(`${[entriesF.partnerReference.api]}`, {
      is: Joi.exist(),
      then: Joi.optional(),
    })
    .messages({
      'any.required': `${entriesF.recordId.api} is required in case ${entriesF.partnerReference.api} is not provided.`,
    }),

  [entriesF.partnerReference.api]: Joi.string().disallow('').optional(),
}).options({abortEarly: false});

module.exports = async (req, res) => {
  const validateBody = await schema.validate(req.query);
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

  req.query = validateBody.value;
  getEntry(req, res);
};

const getEntry = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.query};

    const checkPreviousEntriesRes = await utilAirtable.get.records(
      f.entries.table,
      undefined,
      undefined,
      `AND({${entriesF.isDeleted.db}} = FALSE(), OR( {${
        entriesF.recordId.db
      }} = "${obj[entriesF.recordId.api]}", {${
        entriesF.partnerReference.db
      }} = "${obj[entriesF.partnerReference.api]}"))`
    );
    if (checkPreviousEntriesRes.body.length === 0) {
      throw 'entryNotFound';
    }

    const record = checkPreviousEntriesRes.body[0];
    const recordF = record.fields;

    // Check if the entry of this specific leaser, otherwise return not found
    if (!recordF[entriesF.leaser.db][0] === `${obj[f.auth.fields.id.api]}`)
      throw 'entryNotFound';

    const entryFields = {
      [entriesF.recordId.api]: record.id,
      [entriesF.partnerReference.api]: recordF[entriesF.partnerReference.db],
      [entriesF.cprCvr.api]: recordF[entriesF.cprCvr.db],
      [entriesF.customerName.api]: recordF[entriesF.customerName.db],
      [entriesF.customerEmail.api]: recordF[entriesF.customerEmail.db],
      [entriesF.department.api]: recordF[entriesF.department.db],
      [entriesF.registrationNumber.api]:
        recordF[entriesF.registrationNumber.db],
      [entriesF.registrationDate.api]: recordF[entriesF.registrationDate.db],
      [entriesF.vinNumber.api]: recordF[entriesF.vinNumber.db],
      [entriesF.brand.api]: recordF[entriesF.brand.db],
      [entriesF.model.api]: recordF[entriesF.model.db],
      [entriesF.premium.api]: recordF[entriesF.premium.db],
      [entriesF.excess.api]: recordF[entriesF.excess.db],
      [entriesF.estimatedValue.api]: recordF[entriesF.estimatedValue.db],

      [entriesF.isStill.api]: recordF[entriesF.isStill.db] ? '1' : '0',
      [entriesF.needRoadAssistance.api]: recordF[entriesF.needRoadAssistance.db]
        ? '1'
        : '0',
      [entriesF.needGlassCoverage.api]: recordF[entriesF.needGlassCoverage.db]
        ? '1'
        : '0',
      [entriesF.remarks.api]: recordF[entriesF.remarks.db],
      [entriesF.needReceipt.api]: recordF[entriesF.needReceipt.db] ? '1' : '0',
      [entriesF.emailSent.api]: recordF[entriesF.emailSent.db] ? '1' : '0',
    };

    return res.status(200).send({
      code: 200,
      message: 'Entry retrieved successfully',
      entry: entryFields,
    });
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};
