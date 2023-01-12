const fs = require('fs');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const axios = require('axios');

const uploadFileFromBuffer = require('../files/uploadFileFromBuffer');

const generatePDF = async (filePath, data, fileName) => {
  try {
    const templateHtml = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(templateHtml);
    const finalHtml = encodeURIComponent(template(data));

    const options = {
      format: 'A4',
      // path: fileName,
    };

    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(`data:text/html;charset=UTF-8,${finalHtml}`, {
      waitUntil: 'networkidle0',
    });
    const pdfBuffer = await page.pdf(options);
    await browser.close();

    return pdfBuffer;
  } catch (err) {
    throw err;
  }
};

const getBase64FromURL = async (url) => {
  return axios
    .get(url, {
      responseType: 'arraybuffer',
    })
    .then((response) =>
      Buffer.from(response.data, 'binary').toString('base64')
    );
};

module.exports.generateCertificateAndUploadToStorage = async (
  templatePath,
  data,
  fileName
) => {
  const buffer = await generatePDF(templatePath, data, fileName);
  const certificatePDFURL = await uploadFileFromBuffer(
    buffer,
    `${data.certificateNo}.pdf`
  );

  return certificatePDFURL;
};

module.exports.prepareSendGridAttachments = async (filesArray) => {
  let attachments = [];
  for (let i in filesArray) {
    const file = filesArray[i];
    attachments.push({
      content: await getBase64FromURL(file.url),
      filename: file.name,
      type: file.type,
      disposition: 'attachment',
    });
  }

  return attachments;
};

module.exports.encodeFileName = (fileName) => {
  return `=?UTF-8?B?${Buffer.from(
    unescape(encodeURIComponent(fileName)),
    'binary'
  ).toString('base64')}?=`;
};
