const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');
const utilGeneral = require('util992/functions/general');

const generalFuncs = require('../general');
const errorsFuncs = require('../errors');
const v = require('../../values');
const {filterCodes} = require('../../values/general').functions;

const f = v.fields;
const entriesF = f.entries.fields;
const leasersF = f.leasers.fields;
const agentsF = f.agents.fields;
const codesF = f.codes.fields;

const schema = Joi.object({
  [entriesF.cprCvr.api]: Joi.string().trim().disallow('').required(),
  [entriesF.customerName.api]: Joi.string().trim().disallow('').required(),
  [entriesF.customerEmail.api]: Joi.string().email().required(),
  [entriesF.department.api]: Joi.string().optional().allow(''),
  [entriesF.registrationNumber.api]: Joi.string()
    .when(`${[entriesF.isStill.api]}`, {
      is: Joi.equal(1),
      then: Joi.optional().allow(''),
    })
    .when(`${[entriesF.isStill.api]}`, {
      is: Joi.equal(0),
      then: Joi.required().disallow(''),
    }),
  [entriesF.registrationDate.api]: Joi.date().required(),
  [entriesF.vinNumber.api]: Joi.string().trim().disallow('').required(),
  [entriesF.brand.api]: Joi.string().trim().disallow('').required(),
  [entriesF.model.api]: Joi.string().trim().disallow('').required(),
  [entriesF.excess.api]: Joi.number().required(),
  [entriesF.estimatedValue.api]: Joi.number().required(),

  [entriesF.premium.api]: Joi.number(),
  [entriesF.partnerReference.api]: Joi.string(),
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
  addEntry(req, res);
};

const addEntry = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.body};

    const checkPreviousEntriesRes = await utilAirtable.get.records(
      f.entries.table,
      1,
      undefined,
      `{${entriesF.partnerReference.db}} = "${
        obj[entriesF.partnerReference.api]
      }"`
    );
    if (checkPreviousEntriesRes.body.length > 0) {
      throw 'twoEntriesSamePartnerReference';
    }

    const numberOfEntriesRes = await utilAirtable.get.records(
      v.fields.numberOfEntries.table
    );
    const lastNumberRecordId = numberOfEntriesRes.body[0].id;
    const lastNumber =
      numberOfEntriesRes.body[0].fields[
        v.fields.numberOfEntries.fields.counter.db
      ] + 1;

    const isVehicleStill = obj[entriesF.isStill.api] == '1';
    const entryFields = {
      [entriesF.certificateNo.db]: lastNumber,
      [entriesF.cprCvr.db]: obj[entriesF.cprCvr.api],
      [entriesF.customerName.db]: obj[entriesF.customerName.api],
      [entriesF.customerEmail.db]: obj[entriesF.customerEmail.api],
      [entriesF.department.db]: obj[entriesF.department.api],
      [entriesF.registrationNumber.db]: isVehicleStill
        ? ''
        : obj[entriesF.registrationNumber.api],
      [entriesF.registrationDate.db]: obj[entriesF.registrationDate.api],
      [entriesF.vinNumber.db]: obj[entriesF.vinNumber.api],
      [entriesF.brand.db]: obj[entriesF.brand.api],
      [entriesF.model.db]: obj[entriesF.model.api],
      [entriesF.premium.db]: parseFloat(obj[entriesF.premium.api]),
      [entriesF.excess.db]: parseFloat(obj[entriesF.excess.api]),
      [entriesF.estimatedValue.db]: parseFloat(
        obj[entriesF.estimatedValue.api]
      ),

      [entriesF.partnerReference.db]: obj[entriesF.partnerReference.api],
      [entriesF.isStill.db]: isVehicleStill,
      [entriesF.needRoadAssistance.db]:
        obj[entriesF.needRoadAssistance.api] == '1' ? true : false,
      [entriesF.needGlassCoverage.db]:
        obj[entriesF.needGlassCoverage.api] == '1' ? true : false,
      [entriesF.remarks.db]: obj[entriesF.remarks.api],

      [entriesF.needReceipt.db]:
        obj[entriesF.needReceipt.api] == '1' ? true : false,

      [entriesF.updatedNumber.db]: 0,
      [entriesF.leaser.db]: [`${obj[f.auth.fields.id.api]}`],
    };
    /////// Get Leaser
    const leaserRes = await utilAirtable.get.records(
      v.fields.leasers.table,
      undefined,
      undefined,
      `{${leasersF.recordId.db}} = "${obj[f.auth.fields.id.api]}"`
    );
    const leaser = leaserRes.body[0];
    const leaserAirtableF = leaser.fields;

    const agentsRes = await utilAirtable.get.records(
      v.fields.agents.table,
      undefined,
      undefined,
      `{${agentsF.recordId.db}} = "${
        leaserAirtableF[entriesF.agentRecordId.db][0]
      }"`
    );
    const agent = agentsRes.body[0];
    const agentAirtableF = agent.fields;
    let formula = '';
    if (entryFields[entriesF.isStill.db] == true) {
      formula = `AND({agentId} = "${agent.id}", {${codesF.category.db}} = "${codesF.category.type.stilstand}")`;
    } else {
      if (entryFields[entriesF.needGlassCoverage.db] == true) {
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
    let valueCode = filterCodes(
      entryFields[entriesF.estimatedValue.db],
      codesarr
    );
    if (agent.fields[agentsF.areCodesActive.db] === true) {
      if (valueCode !== undefined) {
        entryFields[entriesF.code.db] = valueCode;
      }
    }
    const addEntryRes = await utilAirtable.set.records(f.entries.table, [
      entryFields,
    ]);
    if (addEntryRes.success) {
      const record = addEntryRes.body[0];

      await utilAirtable.update.records(v.fields.numberOfEntries.table, [
        {
          id: lastNumberRecordId,
          fields: {
            [v.fields.numberOfEntries.fields.counter.db]: lastNumber,
          },
        },
      ]);

      res.status(201).send({
        code: 201,
        [entriesF.recordId.api]: record.id,
        [entriesF.partnerReference.api]:
          record.fields[entriesF.partnerReference.db],
        message: `Entry added successfully, you can use ${
          entriesF.recordId.api
        }${
          record.fields[entriesF.partnerReference.db]
            ? ` or ${entriesF.partnerReference.api}`
            : ''
        } in the future to edit or delete this entry`,
      });

      if (obj[entriesF.needReceipt.api]) {
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
              console.log(err);
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
            `Failed sending email for new entry with id ${record.id}`
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
