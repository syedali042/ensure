const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');
const utilGeneral = require('util992/functions/general');

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
  deleteEntry(req, res);
};

const deleteEntry = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.body};

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

    const updateEntryDeletedRes = await utilAirtable.update.records(
      f.entries.table,
      [
        {
          id: record.id,
          fields: {
            [entriesF.isDeleted.db]: true,
          },
        },
      ]
    );

    if (updateEntryDeletedRes.success) {
      res.status(200).send({
        code: 200,
        message: 'Entry deleted Successfully',
        entry_id: record.id,
      });

      // Deciding either to send email or not is handled by the send entry email endpoint
      const sendEmailRes = await utilGeneral.hitInHouseEndpoint(
        `/api/emails/entry/${record.id}`,
        'post'
      );
    } else throw 'internal';
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};
