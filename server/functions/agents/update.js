const Joi = require("joi");
const utilAirtable = require("util992/functions/airtable");

const errorsFuncs = require("../errors");
const v = require("../../values");

const f = v.fields;
const agentF = f.agents.fields;

const schema = Joi.object({
  [agentF.recordId.api]: Joi.string().required(),

  [agentF.name.api]: Joi.string().trim().disallow(""),
  [agentF.email.api]: Joi.string().trim().disallow(""),
  [agentF.insuranceCompanyEmail.api]: Joi.string().trim().disallow(""),

  [agentF.picture.api]: Joi.string().uri().disallow(""),
  [agentF.logo.api]: Joi.string().uri().disallow(""),
  [agentF.insuranceTerms.api]: Joi.string().uri().disallow(""),

  [agentF.terms.api]: Joi.string().trim(),
  [agentF.guidance.api]: Joi.string().trim(),
  [agentF.protector.api]: Joi.string().trim(),
  [agentF.remark.api]: Joi.string().trim(),
  [agentF.areCodesActive.api]: Joi.boolean(),
}).options({ abortEarly: false });

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
      .send(errorsFuncs.buildError(400, messages.join(", ")));
  }

  req.body = validateBody.value;
  updateAgent(req, res);
};

const updateAgent = async (req, res) => {
  try {
    const obj = { ...req.jwtObj, ...req.body };

    const getAgentRes = await utilAirtable.get.records(
      f.agents.table,
      1,
      undefined,
      `{${agentF.recordId.db}} = "${obj[agentF.recordId.api]}"`
    );

    if (!getAgentRes.success) throw "internal";
    if (getAgentRes.body.length === 0) throw "agentNotFound";

    const record = getAgentRes.body[0];
    const recordId = record.id;
    const recordArr = [
      {
        id: recordId,
        fields: await buildFields(obj),
      },
    ];

    const updateAgentRes = await utilAirtable.update.records(
      f.agents.table,
      recordArr
    );

    if (updateAgentRes.success) {
      const record = updateAgentRes.body[0];
      return res.status(200).send({
        code: 200,
        [agentF.recordId.api]: record.id,
        message: `Agent updated successfully`,
      });
    } else {
      throw "internal";
    }
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};

const buildFields = async (obj) => {
  let fields = {
    [agentF.name.db]: obj[agentF.name.api] ? obj[agentF.name.api] : null,
    [agentF.email.db]: obj[agentF.email.api] ? obj[agentF.email.api] : null,
    [agentF.insuranceCompanyEmail.db]: obj[agentF.insuranceCompanyEmail.api]
      ? obj[agentF.insuranceCompanyEmail.api]
      : null,
    [agentF.picture.db]: obj[agentF.picture.api]
      ? [{ url: obj[agentF.picture.api] }]
      : null,
    [agentF.logo.db]: obj[agentF.logo.api]
      ? [{ url: obj[agentF.logo.api] }]
      : null,
    [agentF.insuranceTerms.db]: obj[agentF.insuranceTerms.api]
      ? [{ url: obj[agentF.insuranceTerms.api] }]
      : null,
    [agentF.terms.db]: obj[agentF.terms.api] ? obj[agentF.terms.api] : null,
    [agentF.guidance.db]: obj[agentF.guidance.api]
      ? obj[agentF.guidance.api]
      : null,
    [agentF.protector.db]: obj[agentF.protector.api]
      ? obj[agentF.protector.api]
      : null,
    [agentF.remark.db]: obj[agentF.remark.api] ? obj[agentF.remark.api] : null,
    [agentF.areCodesActive.db]:
      obj[agentF.areCodesActive.api] !== undefined
        ? obj[agentF.areCodesActive.api]
        : obj[agentF.areCodesActive.api] == false
        ? false
        : true,
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
