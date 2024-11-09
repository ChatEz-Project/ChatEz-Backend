const {ref} = require("firebase/storage");
const storage = require('../FirebaseAdmin').storage;

const dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

async function uploadFileToFirebase(file, sender) {
  try {
    console.log(`storing file ${file.originalname}`);
    const bucket = storage.bucket(process.env.BUCKET_URI);
    const fileRef = sender + "-" + Date.now().toString() + "-" + file.originalname
    const fileUpload = bucket.file(process.env.BUCKET_MESSAGE_FILE_FOLDER + fileRef);
    await fileUpload.save(file.buffer);
    console.log(`stored file ${fileRef}`)
    return fileRef
  } catch (error) {
    console.error(`Error uploading file to Firebase: ${error}`);
    throw error;
  }
}

module.exports = {
  uploadFileToFirebase
}