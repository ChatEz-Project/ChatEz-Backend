const admin = require("firebase-admin");

const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

if (admin.apps[0] == undefined) { // check if exists so no more than 1 instance is created
  admin.initializeApp({ //initialise here so available globally,
    projectId : process.env.PROJECT_ID,
    credential: admin.credential.applicationDefault()
  });
}

module.exports = {
  admin: admin
};