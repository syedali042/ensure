require('dotenv').config();

var admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.js');

module.exports = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET_URL,
});
