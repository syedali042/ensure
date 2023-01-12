const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');
const utilGeneral = require('util992/functions/general');

const generalFuncs = require('../general');
const errorsFuncs = require('../errors');
const v = require('../../values');

const f = v.fields;
const codeF = f.codes.fields;

module.exports = async (req, res) => {
  addCodes(req, res);
};

const addCodes = async (req, res) => {
  try {
    const checkPreviousEntriesRes = await utilAirtable.get.records(
      f.codes.table,
      undefined,
      undefined,
      undefined
    );
    const obj = {Agent: req.body.Agent};
    let rows = req.body.codes;
    const codes = checkPreviousEntriesRes.body;

    let message = '';
    let codesArr = [];
    if (codes.length === 0) {
      message = 'No codes found.';
    } else {
      message = `${codes.length} codes found`;

      for (let key in codes) {
        const code = codes[key];
        if (code.fields[codeF.agent.db][0] == obj[codeF.agent.api]) {
          codesArr.push(code.id);
        }
      }
    }
    if (codesArr.length > 0) {
      const deletePre = await utilAirtable.clear.records(
        f.codes.table,
        codesArr,
        undefined,
        undefined,
        undefined
      );

      if (deletePre.success === true) {
        if (rows.length > 0) {
          let newCodesArray = [];
          rows.map((code) => {
            let codes = {
              [codeF.agent.db]: [obj[codeF.agent.api]],
              [codeF.category.db]: code[codeF.category.api],
              [codeF.minValue.db]: code[codeF.minValue.api],
              [codeF.maxValue.db]: code[codeF.maxValue.api],
              [codeF.value.db]: code[codeF.value.api],
              [codeF.code.db]: code[codeF.code.api],
            };
            newCodesArray.push(codes);
          });
          const addCodesRes = await utilAirtable.set.records(
            f.codes.table,
            newCodesArray
          );

          if (addCodesRes.success) {
            res.status(201).send({
              code: 201,
            });
          } else {
            throw 'internal';
          }
        } else {
          res.status(201).send({
            code: 201,
          });
        }
      }
    } else {
      if (rows.length > 0) {
        let newCodesArray = [];
        rows.map((code) => {
          let codes = {
            [codeF.agent.db]: [obj[codeF.agent.api]],
            [codeF.category.db]: code[codeF.category.api],
            [codeF.minValue.db]: code[codeF.minValue.api],
            [codeF.maxValue.db]: code[codeF.maxValue.api],
            [codeF.value.db]: code[codeF.value.api],
            [codeF.code.db]: code[codeF.code.api],
          };
          newCodesArray.push(codes);
        });
        const addCodesRes = await utilAirtable.set.records(
          f.codes.table,
          newCodesArray
        );
        if (addCodesRes.success) {
          res.status(201).send({
            code: 201,
          });
        } else {
          throw 'internal';
        }
      } else {
        res.status(201).send({
          code: 201,
        });
      }
    }
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};
