const accessSecret = require('../SecretManager');
const Message = require('./Model');

const dotenv = require("dotenv");
const mongoose = require('mongoose')

const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

async function connectToDatabase() {
  try {
    const mongoPassword = await accessSecret(`Mongo_${process.env.MONGO_USERNAME}`);
    const dbURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${mongoPassword}@chatez.9mxcu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=ChatEz`;
    await mongoose.connect(dbURI, {});
  } catch (err) {
    console.error('Database connection error:', err); throw err;
  }
}

async function storeNewMessage(message){
  try{
    return await message.save()
  }catch(err){
    console.error(err); throw err;
  }
}

module.exports = {
  storeNewMessage,
  connectToDatabase,
}