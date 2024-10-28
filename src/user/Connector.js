const db = require("../FirebaseAdmin").db;

const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

async function userExists(email)  {
  console.log(`Checking if ${email} exists in users`)

  try {
    const res = await db
      .collection("users")
      .where("email", "==", email)
      .get()

    return !res.empty;
  } catch (error){
    console.error("Error when executing userExists", error)
    return false
  }
}

module.exports = {
  userExists
}