const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');

const errorsFuncs = require('../../errors');
const v = require('../../../values');

const f = v.fields;
const codeF = f.codes.fields;

const schema = Joi.object({
  [codeF.agent.api]: Joi.string().trim().disallow('').required(),
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
  getCodes(req, res);
};

const getCodes = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.params};
    // console.log(obj);
    const checkPreviousEntriesRes = await utilAirtable.get.records(
      f.codes.table,
      undefined,
      undefined,
      undefined,
      undefined,
      [{field: codeF.minValue.db, direction: 'asc'}]
    );

    const codes = checkPreviousEntriesRes.body;

    let message = '';
    let codesArr = [];
    let stilArr = [];
    let withGlassArr = [];
    let withoutGlassArr = [];
    if (codes.length === 0) {
      message = 'No codes found.';
    } else {
      message = `${codes.length} codes found`;

      for (let key in codes) {
        const code = codes[key];
        if (code.fields[codeF.agent.db] == obj[codeF.agent.api]) {
          codesArr.push({
            [codeF.recordId.api]: code.id,
            [codeF.code.api]: code.fields[codeF.code.db],
            [codeF.minValue.api]: code.fields[codeF.minValue.db],
            [codeF.maxValue.api]: code.fields[codeF.maxValue.db],
            [codeF.category.api]: code.fields[codeF.category.db],
            [codeF.value.api]: code.fields[codeF.value.db],
            [codeF.agent.api]: code.fields[codeF.agent.db][0],
          });
        }
      }
    }

    for (var i = codesArr.length; i >= codesArr.length; i--) {
      // console.log(i);
    }
    return res.status(200).send({
      code: 200,
      message: 'Code retrieved successfully',
      codes: codesArr,
    });
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};
