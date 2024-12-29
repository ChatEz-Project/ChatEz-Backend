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

async function deleteFileFromFirebase(fileRef) {
  try{
    const bucket = storage.bucket(process.env.BUCKET_URI);
    const fileRefChopped = decodeURIComponent(fileRef)
      .split(process.env.BUCKET_MESSAGE_FILE_FOLDER)
      .pop()
    console.log(`will attempt to delete ${fileRefChopped}`);
    const fileToDelete = bucket.file(process.env.BUCKET_MESSAGE_FILE_FOLDER + fileRefChopped);

    const [exists] = await fileToDelete.exists();
    if (!exists) {
      console.log(`File does not exist in firebase, skipping deletion.`);
      return;
    }
    await fileToDelete.delete();
    console.log(`Successfully deleted file: ${fileRef}`);
  }catch(error){
    console.error(`Error deleting photo: ${error}`);
    throw error;
  }
}


module.exports = {
  uploadFileToFirebase,
  deleteFileFromFirebase
}
