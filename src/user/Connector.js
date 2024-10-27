const db = require("../FirebaseAdmin").db;

const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

async function userExists(email)  {
  console.log(`Checking if ${email} exists`)
  try {
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return false
    } else {
      return true
    }
  } catch (error){
    console.error("Error when executing userExists", error)
    throw error
  }
}

module.exports = {
  userExists
}