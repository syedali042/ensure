const path = require('path');
const Joi = require('joi');
const utilAirtable = require('util992/functions/airtable');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');

const generalFuncs = require('../general');
const errorsFuncs = require('../errors');
const v = require('../../values');
const helpers = require('./helpers');

const f = v.fields;
const entriesF = v.fields.entries.fields;
const codesF = v.fields.codes.fields;
const leasersF = v.fields.leasers.fields;
const agentsF = v.fields.agents.fields;
const authF = v.fields.auth.fields;

const schema = Joi.object({
  recordId: Joi.string().trim().disallow('').required(),
  [authF.type.api]: Joi.string()
    .disallow('')
    .valid(authF.entryType.value)
    .required(),
  isResending: Joi.boolean().default(false),
}).options({abortEarly: false});

module.exports = async (req, res) => {
  const validateBody = await schema.validate({...req.params, ...req.body});
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
  sendEmail(req, res);
};

const sendEmail = async (req, res) => {
  try {
    const obj = {...req.jwtObj, ...req.params, ...req.body};

    // TODO: would be used  in case in future added protection to the email sending
    // const whoseSending =
    //   obj.type === 'leaser'
    //     ? entriesF.leaserRecordId.db
    //     : entriesF.agentRecordId.db;
    const formula = `{${entriesF.recordId.db}} = "${obj.recordId}"`;

    const entryRes = await utilAirtable.get.records(
      v.fields.entries.table,
      undefined,
      undefined,
      formula
    );

    if (entryRes.success) {
      const entry = entryRes.body[0];
      const entryAirtableF = entry.fields;
      const leaserRes = await utilAirtable.get.records(
        v.fields.leasers.table,
        undefined,
        undefined,
        `{${leasersF.recordId.db}} = "${
          entryAirtableF[entriesF.leaserRecordId.db][0]
        }"`
      );
      const leaser = leaserRes.body[0];
      const leaserAirtableF = leaser.fields;

      const agentsRes = await utilAirtable.get.records(
        v.fields.agents.table,
        undefined,
        undefined,
        `{${agentsF.recordId.db}} = "${
          entryAirtableF[entriesF.agentRecordId.db][0]
        }"`
      );
      const agent = agentsRes.body[0];
      const agentAirtableF = agent.fields;
      if (agent.fields[agentsF.areCodesActive.db] === true) {
        if (entryAirtableF[entriesF.code.db] !== undefined) {
          entryAirtableF[entriesF.estimatedValue.db] = false;
        } else if (entryAirtableF[entriesF.code.db] == undefined) {
          entryAirtableF[entriesF.code.db] == false;
        }
      }
      const isUpdated = entryAirtableF[entriesF.updatedNumber.db] > 0;
      const isDeleted = entryAirtableF[entriesF.isDeleted.db];
      const isVehicleStill = entryAirtableF[entriesF.isStill.db];

      let fieldsForTemplate = generateFields(
        entryAirtableF,
        leaserAirtableF,
        agentAirtableF,
        isVehicleStill
      );
      // TEMP Values until we work on the bigger scoped project, and we allow customizing the email and PDF for each leaser
      // related ONLY to the leaser SCL with Gjensidige insurance, covers all glass damage by default
      fieldsForTemplate.tempCoverGlassByDefault =
        leaserAirtableF[leasersF.recordId.db] === 'recINh1cZxu746cNq' &&
        agentAirtableF[agentsF.recordId.db] === 'reclJaubUEM05A5CF';

      let attachedFilesArray = [];
      let toEmailsArray = [
        {
          email: fieldsForTemplate.agentEmail,
          name: fieldsForTemplate.agentName,
        },
      ];
      if (fieldsForTemplate.insuranceCompanyEmail)
        toEmailsArray.push({
          email: fieldsForTemplate.insuranceCompanyEmail,
        });

      let certificatePDFURL = '';
      // New Entry or Updated Entry
      if (!isDeleted) {
        // Send to customer too
        toEmailsArray.push({
          email: fieldsForTemplate.customerEmail,
          name: fieldsForTemplate.customerName,
        });

        // If new entry, attach the insurance terms pdf
        if (!isUpdated) {
          const insuranceTermsPDFURL = fieldsForTemplate.insuranceTerms;
          if (insuranceTermsPDFURL)
            attachedFilesArray.push({
              url: insuranceTermsPDFURL,
              name: helpers.encodeFileName('Forsikringsbetingelser.pdf'),
              type: 'application/pdf',
            });
        }

        // If just resending email and certificate already present, no need to re-generate certificate again
        if (obj.isResending && fieldsForTemplate.certificate) {
          certificatePDFURL = fieldsForTemplate.certificate;
        } else {
          try {
            // Generate Certificate
            const templatePath = path.join(
              process.cwd(),
              './server/functions/emails/pdfTemplates/certificate.html'
            );
            certificatePDFURL =
              await helpers.generateCertificateAndUploadToStorage(
                templatePath,
                fieldsForTemplate,
                'certifikat.pdf'
              );
          } catch (err) {
            console.dir(err, {depth: null});
            generalFuncs.notifyError(
              `Certificate couldn't be generated for ${entryType} entry ${obj.recordId}!`
            );
          }
        }

        if (certificatePDFURL) {
          attachedFilesArray.push({
            url: certificatePDFURL,
            name: helpers.encodeFileName('Certifikat.pdf'),
            type: 'application/pdf',
          });
        }

        // If Road assistance is selected, attach the road assistance pdf if present
        if (entryAirtableF[entriesF.needRoadAssistance.db]) {
          const roadAssistancePDFURL = fieldsForTemplate.roadAssistance;
          if (roadAssistancePDFURL)
            attachedFilesArray.push({
              url: roadAssistancePDFURL,
              name: helpers.encodeFileName('Vejhjælp.pdf'),
              type: 'application/pdf',
            });
        }

        if (isVehicleStill)
          fieldsForTemplate.emailSubject = `Stilstand - Nyt certifikat genereret af ${fieldsForTemplate.leaserName} - ${fieldsForTemplate.vinNumber}`;
        else
          fieldsForTemplate.emailSubject = `Nyt certifikat genereret af ${fieldsForTemplate.leaserName} - ${fieldsForTemplate.registrationNumber}`;
      }
      // Deleted Entry
      else {
        if (isVehicleStill) fieldsForTemplate.emailSubject = `Stilstand ophør`;
        else
          return res.status(200).send({
            code: 200,
            message:
              'No Email to be sent since the vehicle is not still and entry is deleted',
            body: {},
          });
      }

      const msg = {
        to: toEmailsArray,
        from: {
          email: v.sendGrid.sendingEmailAddress,
          name: v.sendGrid.sendingName,
        },
        attachments: await helpers.prepareSendGridAttachments(
          attachedFilesArray
        ),
        templateId: v.sendGrid.entryEmailTemplateId,
        dynamicTemplateData: fieldsForTemplate,
        hideWarnings: true,
      };

      let sendEmailError = null;
      await sgMail.send(msg).catch((err) => {
        console.log('couldNotSendEmail');
        console.dir(err, {depth: null});

        generalFuncs.notifyError(
          `Email couldn't be sent for ${entryType} entry ${obj.recordId}!`
        );
        sendEmailError = err;
      });

      const currentTime = moment()
        .tz(v.time.timeZoneStr())
        .format('YYYY/MM/DD HH:mm:ss');

      const entryType = isUpdated ? 'updated' : 'new';
      if (!sendEmailError) {
        console.log(
          `Email sent successfully to ${JSON.stringify(
            msg.to
          )} for ${entryType} entry ${obj.recordId}`
        );

        if (certificatePDFURL)
          // Set Email Sent in Airtable
          try {
            const updateEntryRes = await utilAirtable.update.records(
              f.entries.table,
              [
                {
                  id: obj.recordId,
                  fields: {
                    [entriesF.emailSent.db]: true,
                    [entriesF.certificate.db]: certificatePDFURL
                      ? [
                          {
                            url: certificatePDFURL,
                            filename: `certifikat - ${currentTime}`,
                          },
                        ]
                      : undefined,
                  },
                },
              ]
            );
          } catch (err) {
            console.dir(err, {depth: null});
            generalFuncs.notifyError(
              `Certificate couldn't be uploaded into Airtable for ${entryType} entry ${obj.recordId}!`
            );
          }

        return res.status(200).send({
          code: 200,
        });
      }
    } else {
      throw 'internal';
    }
  } catch (err) {
    const error = errorsFuncs.getError(err);
    res.status(error.code).send(error);
  }
};

const generateFields = (
  entryAirtableF,
  leaserAirtableF,
  agentAirtableF,
  isVehicleStill
) => {
  return {
    createdAt: v.time.getTimeInCorrectTimeZone(
      entryAirtableF[entriesF.createdAt.db]
    ),
    updatedAt: entryAirtableF[entriesF.updatedNumber.db]
      ? v.time.getTimeInCorrectTimeZone(
          entryAirtableF[entriesF.lastUpdatedAt.db]
        )
      : '',

    certificateNo: entryAirtableF[entriesF.certificateNo.db],

    leaserId: entryAirtableF[leasersF.recordId.db][0],
    leaserName: leaserAirtableF[leasersF.name.db],
    leaserEmail: leaserAirtableF[leasersF.email.db],
    leaserLogo: leaserAirtableF[leasersF.logo.db]
      ? leaserAirtableF[leasersF.logo.db][0].url
      : '',
    roadAssistance: leaserAirtableF[leasersF.roadAssistance.db]
      ? leaserAirtableF[leasersF.roadAssistance.db][0].url
      : '',

    cprCvr: entryAirtableF[entriesF.cprCvr.db],
    customerName: entryAirtableF[entriesF.customerName.db],
    customerEmail: entryAirtableF[entriesF.customerEmail.db],
    registrationNumber: isVehicleStill
      ? ''
      : entryAirtableF[entriesF.registrationNumber.db],
    registrationDate: entryAirtableF[entriesF.registrationDate.db],
    vinNumber: entryAirtableF[entriesF.vinNumber.db],
    brand: entryAirtableF[entriesF.brand.db],
    model: entryAirtableF[entriesF.model.db],
    premium: entryAirtableF[entriesF.premium.db],
    excess: entryAirtableF[entriesF.excess.db],
    estimatedValue: entryAirtableF[entriesF.estimatedValue.db]
      ? entryAirtableF[entriesF.estimatedValue.db]
      : false,
    code: entryAirtableF[entriesF.code.db]
      ? entryAirtableF[entriesF.code.db]
      : false,
    partnerReference: entryAirtableF[entriesF.partnerReference.db]
      ? entryAirtableF[entriesF.partnerReference.db]
      : '',
    isStill: isVehicleStill,
    liability: isVehicleStill ? false : true,
    needRoadAssistance: entryAirtableF[entriesF.needRoadAssistance.db],
    needGlassCoverage: entryAirtableF[entriesF.needGlassCoverage.db],
    remarks: isVehicleStill ? entryAirtableF[entriesF.remarks.db] : '',

    certificate: entryAirtableF[entriesF.certificate.db]
      ? entryAirtableF[entriesF.certificate.db][0].url
      : '',

    policyNumber: leaserAirtableF[leasersF.policyNumber.db],

    insuranceTerms: agentAirtableF[agentsF.insuranceTerms.db]
      ? agentAirtableF[agentsF.insuranceTerms.db][0].url
      : '',
    insuranceCompanyEmail: agentAirtableF[agentsF.insuranceCompanyEmail.db],

    agentId: entryAirtableF[agentsF.recordId.db][0],
    agentName: agentAirtableF[agentsF.name.db],
    agentEmail: agentAirtableF[agentsF.email.db],
    agentLogo: agentAirtableF[agentsF.logo.db]
      ? agentAirtableF[agentsF.logo.db][0].url
      : '',

    agentTerms: agentAirtableF[agentsF.terms.db],
    agentGuidance: agentAirtableF[agentsF.guidance.db],
    agentProtector: agentAirtableF[agentsF.protector.db],
    agentRemarks: agentAirtableF[agentsF.remark.db]
      ? agentAirtableF[agentsF.remark.db]
      : '',

    year: new Date().getFullYear(),
  };
};
