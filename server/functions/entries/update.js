const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');
const utilGeneral = require('util992/functions/general');

const generalFuncs = require('../general');
const {filterCodes} = require('../../values/general').functions;
const errorsFuncs = require('../errors');
const v = require('../../values');

const f = v.fields;
const entriesF = f.entries.fields;
const agentsF = f.agents.fields;
const codesF = f.codes.fields;

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

  [entriesF.cprCvr.api]: Joi.string().trim().disallow(''),
  [entriesF.customerName.api]: Joi.string().trim().disallow(''),
  [entriesF.customerEmail.api]: Joi.string().trim().disallow('').email(),
  [entriesF.department.api]: Joi.string().optional().allow(''),
  [entriesF.registrationNumber.api]: Joi.string().trim().disallow(''),
  [entriesF.registrationDate.api]: Joi.date(),
  [entriesF.vinNumber.api]: Joi.string().trim().disallow(''),
  [entriesF.brand.api]: Joi.string().trim().disallow(''),
  [entriesF.model.api]: Joi.string().trim().disallow(''),
  [entriesF.premium.api]: Joi.number(),
  [entriesF.excess.api]: Joi.number(),
  [entriesF.estimatedValue.api]: Joi.number(),
  [entriesF.code.api]: Joi.string().trim().disallow(''),
  [entriesF.isStill.api]: Joi.number().valid(0, 1),
  [entriesF.needRoadAssistance.api]: Joi.number().valid(0, 1),
  [entriesF.needGlassCoverage.api]: Joi.number().valid(0, 1),
  [entriesF.remarks.api]: Joi.string().allow(''),

  [entriesF.needReceipt.api]: Joi.number().valid(0, 1),
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
  updateEntry(req, res);
};

const updateEntry = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.body};
    const getEntryRes = await utilAirtable.get.records(
      f.entries.table,
      1,
      undefined,
      `AND({${entriesF.isDeleted.db}} = FALSE(), OR( {${
        entriesF.recordId.db
      }} = "${obj[entriesF.recordId.api]}", {${
        entriesF.partnerReference.db
      }} = "${obj[entriesF.partnerReference.api]}"))`
    );

    if (!getEntryRes.success) throw 'internal';
    if (getEntryRes.body.length === 0) throw 'entryNotFound';

    const record = getEntryRes.body[0];

    const agentsRes = await utilAirtable.get.records(
      v.fields.agents.table,
      undefined,
      undefined,
      `{${agentsF.recordId.db}} = "${
        record.fields[entriesF.agentRecordId.db][0]
      }"`
    );
    const agent = agentsRes.body[0];
    const agentAirtableF = agent.fields;
    let formula = '';
    if (obj[entriesF.isStill.api] == true) {
      formula = `AND({agentId} = "${agent.id}", {${codesF.category.db}} = "${codesF.category.type.stilstand}")`;
    } else {
      if (obj[entriesF.needGlassCoverage.api] == true) {
        formula = `AND({agentId} = "${agent.id}", AND({${
          codesF.category.db
        }} = "${codesF.category.type.glass}", {${codesF.value.db}} = ${1}))`;
      } else {
        formula = `AND({agentId} = "${agent.id}", AND({${
          codesF.category.db
        }} = "${codesF.category.type.glass}", {${codesF.value.db}} != ${1}))`;
      }
    }
    const codesRes = await utilAirtable.get.records(
      v.fields.codes.table,
      undefined,
      undefined,
      formula
    );
    const codes = codesRes;
    let codesarr = codes.body;
    let valueCode = filterCodes(obj[entriesF.estimatedValue.api], codesarr);
    if (agent.fields[agentsF.areCodesActive.db] === true) {
      if (valueCode !== undefined) {
        obj[entriesF.code.api] = valueCode;
      }
    }

    const recordId = record.id;
    const wasStill = record.fields[entriesF.isStill.db];
    const needRoadAssistance = record.fields[entriesF.needRoadAssistance.db];
    const needGlassCoverage = record.fields[entriesF.needGlassCoverage.db];

    const recordArr = [
      {
        id: recordId,
        fields: await buildFields(
          obj,
          record.fields[entriesF.updatedNumber.db]
        ),
      },
    ];

    const updateEntryRes = await utilAirtable.update.records(
      f.entries.table,
      recordArr
    );

    if (updateEntryRes.success) {
      const record = updateEntryRes.body[0];
      res.status(200).send({
        code: 200,
        [entriesF.recordId.api]: record.id,
        [entriesF.partnerReference.api]:
          record.fields[entriesF.partnerReference.db],
        message: `Entry updated successfully`,
      });

      // Send Email Conditions Related
      const isToSendEmail = record.fields[entriesF.needReceipt.db];

      const isStill = record.fields[entriesF.isStill.db];
      const stillChangedFromNotStillToStill = !wasStill && isStill;

      const newRoadAssistance = record.fields[entriesF.needRoadAssistance.db];
      const newGlassCoverage = record.fields[entriesF.needGlassCoverage.db];

      const needRoadAssistanceChanged =
        newRoadAssistance === needRoadAssistance ? false : true;
      const needGlassCoverageChanged =
        newGlassCoverage === needGlassCoverage ? false : true;
      // Send Email Conditions Related

      if (
        isToSendEmail &&
        // if wasn't still before and now updated to still then notify in email
        (stillChangedFromNotStillToStill ||
          // if needRoadAssistance changed then notify in email
          needRoadAssistanceChanged ||
          // if needGlassCoverage changed then notify in email
          needGlassCoverageChanged)
      ) {
        let isSuccess = false;
        await utilGeneral.performActionRepeatedly(
          async () => {
            try {
              const sendEmailRes = await utilGeneral.hitInHouseEndpoint(
                `/api/emails/entry/${record.id}`,
                'post'
              );
              return sendEmailRes;
            } catch (err) {
              return {
                body: {
                  code: 500,
                },
              };
            }
          },
          async (response) => {
            if (response.body.code === 200) {
              isSuccess = true;
              return true;
            } else return false;
          },
          5,
          {},
          10000
        );

        if (!isSuccess)
          generalFuncs.notifyError(
            `Failed sending email for updated entry with id ${record.id}!`
          );
      }
    } else {
      throw 'internal';
    }
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};

const buildFields = async (obj, updatedNumber) => {
  const isVehicleStill =
    obj[entriesF.isStill.api] == '1'
      ? true
      : obj[entriesF.isStill.api] == '0'
      ? false
      : null;

  let fields = {
    [entriesF.cprCvr.db]: obj[entriesF.cprCvr.api]
      ? obj[entriesF.cprCvr.api]
      : null,
    [entriesF.customerName.db]: obj[entriesF.customerName.api]
      ? obj[entriesF.customerName.api]
      : null,
    [entriesF.customerEmail.db]: obj[entriesF.customerEmail.api]
      ? obj[entriesF.customerEmail.api]
      : null,
    [entriesF.department.db]: obj[entriesF.department.api]
      ? obj[entriesF.department.api]
      : '',
    [entriesF.registrationNumber.db]: isVehicleStill
      ? ''
      : obj[entriesF.registrationNumber.api]
      ? obj[entriesF.registrationNumber.api]
      : null,
    [entriesF.registrationDate.db]: obj[entriesF.registrationDate.api]
      ? obj[entriesF.registrationDate.api]
      : null,
    [entriesF.vinNumber.db]: obj[entriesF.vinNumber.api]
      ? obj[entriesF.vinNumber.api]
      : null,
    [entriesF.brand.db]: obj[entriesF.brand.api]
      ? obj[entriesF.brand.api]
      : null,
    [entriesF.model.db]: obj[entriesF.model.api]
      ? obj[entriesF.model.api]
      : null,
    [entriesF.premium.db]: parseFloat(obj[entriesF.premium.api])
      ? parseFloat(obj[entriesF.premium.api])
      : null,
    [entriesF.excess.db]: parseFloat(obj[entriesF.excess.api])
      ? parseFloat(obj[entriesF.excess.api])
      : null,
    [entriesF.estimatedValue.db]: parseFloat(obj[entriesF.estimatedValue.api])
      ? parseFloat(obj[entriesF.estimatedValue.api])
      : null,
    [entriesF.code.db]: obj[entriesF.code.api] ? obj[entriesF.code.api] : null,
    [entriesF.partnerReference.db]: obj[entriesF.partnerReference.api]
      ? obj[entriesF.partnerReference.api]
      : null,
    [entriesF.isStill.db]: isVehicleStill,
    [entriesF.needRoadAssistance.db]:
      obj[entriesF.needRoadAssistance.api] == '1'
        ? true
        : obj[entriesF.needRoadAssistance.api] == '0'
        ? false
        : null,
    [entriesF.needGlassCoverage.db]:
      obj[entriesF.needGlassCoverage.api] == '1'
        ? true
        : obj[entriesF.needGlassCoverage.api] == '0'
        ? false
        : null,

    [entriesF.remarks.db]: obj[entriesF.remarks.api],

    [entriesF.updatedNumber.db]: updatedNumber + 1,
    [entriesF.leaser.db]: obj[f.auth.fields.id.api]
      ? [`${obj[f.auth.fields.id.api]}`]
      : null,
  };

  const valueOfNeedReceiptProvided = obj[entriesF.needReceipt.api];

  if (valueOfNeedReceiptProvided == '1' || valueOfNeedReceiptProvided == '0') {
    fields[entriesF.needReceipt.db] =
      valueOfNeedReceiptProvided == '1' ? true : false;
  }

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
