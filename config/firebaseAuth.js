// firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
