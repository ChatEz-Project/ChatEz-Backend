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
    await mongoose.connect(dbURI, {
      maxPoolSize: process.env.MONGO_MAX_CONNECTIONS
    });
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

async function getUserMessages(email){
  try {
    return await Message.find({
      $or: [
        { recipient: email },
        { sender: email }
      ]
    }).sort({"dateSent": -1});
  }catch(err){
    console.error(err); throw err;
  }
}

async function getFriendMessages(clientEmail, friendEmail){
  try {
    return await Message.find({
      $or: [
        {$and:[
          { recipient: clientEmail },
          { sender: friendEmail }
        ]},
        {$and:[
          { recipient: friendEmail },
          { sender: clientEmail }
        ]}
      ]
    }).sort({"dateSent": -1});
  }catch(err){
    console.error(err); throw err;
  }
}

async function setFriendMessageRead(clientEmail, friendEmail){
  try{
    return await Message.updateMany(
      {$and:[
          { recipient: clientEmail },
          { sender: friendEmail }
        ]},
      {read: true},
      {latest: true}
    );
  }catch(err){console.error(err); throw err; }
}

async function getLatestMessageFromEachConversation(email){
  try {
    return await await Message.aggregate([
      {
        $match: {
          $or: [
            { recipient: email },
            { sender: email }
          ]
        }
      },
      {
        $sort: { dateSent: -1 }
      },
      {
        $group: {
          _id: {
            // Use sender and recipient to group conversations
            conversation: {
              $cond: [
                { $gte: [{ $cmp: ["$sender", "$recipient"] }, 0] },
                { $concat: ["$recipient", "-", "$sender"] },
                { $concat: ["$sender", "-", "$recipient"] }
              ]
            }
          },
          latestMessage: { $first: "$$ROOT" } // Get the first (latest) message from each conversation
        }
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" } // Replace the root with the latest message
      }
    ]).sort({"dateSent": -1});
  }catch(err){
    console.error(err); throw err;
  }
} //mongo aggregation used rather than in code filtering as it is more efficient

async function testOnlyDeleteAll() {
  try{
    return await Message.deleteMany();
  }catch(err){console.error(err); throw err;}
}

module.exports = {
  storeNewMessage,
  connectToDatabase,
  getUserMessages,
  testOnlyDeleteAll,
  getFriendMessages,
  setFriendMessageRead,
  getLatestMessageFromEachConversation
}
