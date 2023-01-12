const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const utilAirtable = require('util992/functions/airtable');
const utilGeneral = require('util992/functions/general');

require('dotenv').config();
const upload = multer({storage: multer.memoryStorage()});

const admin = require('../functions/firebase');

const v = require('../values');

const filesRouter = express.Router();
filesRouter.use(bodyParser.json());

filesRouter
  .route('/upload')
  .all((req, res, next) => {
    res.status(200).setHeader('Content-Type', 'application/json');
    next();
  })
  .post(upload.single('file'), async (req, res, next) => {
    try {
      const fileURL = await uploadFile(req.file);
      // Uploaded Successfully
      res.status(200).send(fileURL);
    } catch (err) {
      console.log(err, ' err');
      res.status(500).json(err);
    }
  });

const uploadFile = async (fileObj) => {
  const fileName = Date.now() + '-' + fileObj.originalname;
  const bucket = admin.storage().bucket();
  const file = bucket.file(`${fileName}`);

  return new Promise(async (resolve, reject) => {
    try {
      await file
        .createWriteStream()
        .on('finish', async () => {
          const returnedURL = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
          });
          resolve(returnedURL[0]);
        })
        .end(fileObj.buffer);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = filesRouter;
