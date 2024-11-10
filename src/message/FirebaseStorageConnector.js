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
    fileUpload.makePublic(); //allows permament url creation
    return fileUpload.publicUrl();
  } catch (error) {
    console.error(`Error uploading file to Firebase: ${error}`);
    throw error;
  }
}

async function testOnlyDeleteDirectoryContents() {
  try {
    console.log(`Deleting contents of directory: ${process.env.BUCKET_MESSAGE_FILE_FOLDER}`);
    const bucket = storage.bucket(process.env.BUCKET_URI);

    const [files] = await bucket.getFiles({
      prefix: process.env.BUCKET_MESSAGE_FILE_FOLDER
    });

    const deletePromises = files.map(file => {
      console.log(`Deleting file: ${file.name}`);
      return file.delete();
    });

    await Promise.all(deletePromises);

    console.log(`Successfully deleted all files in ${process.env.BUCKET_MESSAGE_FILE_FOLDER}`);
  } catch (error) {
    console.error(`Error deleting directory contents: ${error}`);
    throw error;
  }
}

module.exports = {
  uploadFileToFirebase,
  testOnlyDeleteDirectoryContents
}
