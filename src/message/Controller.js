const MessageConnector = require("./MongoConnector");
const FirebaseStorageConnector = require("./FirebaseStorageConnector");
const UserConnector = require("../user/MongoConnector");
const Message = require("./Model")
const Auth = require("../Auth");

const dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const sendMessage = async (req, res) => {
  try{
    const sender = Auth.getClientEmail(req);
    const { recipient } = req.params;
    const messageContent = req.body.message;

    if (!messageContent) {
      return res.status(400).send('Message content required in body');
    }

    if(await UserConnector.getUser(recipient) == null){
      return res.status(404).send(`recipient ${recipient} not found`);
    }

    let fileUrl = null;
    if(req.file != null){
      fileUrl = await FirebaseStorageConnector.uploadFileToFirebase(req.file, sender);
      console.log(`uploaded message file: ${fileUrl}`);
    }

    const message = new Message({
      sender   : sender,
      recipient: recipient,
      fileUrl  : fileUrl,
      message  : messageContent
    })

    await MessageConnector.storeNewMessage(message)
    return res.status(200).send("Message sent successfully");
  }catch(err){
    return res.status(500).send(`Server Error: ${err}`);
  }
}

const getMessages = async (req, res) => {
  try{
    const client = Auth.getClientEmail(req);
    console.log(`Getting messages for ${client}`);
    const messages = await MessageConnector.getUserMessages(client);
    return res.status(200).send(messages);
  }catch (err){
    console.error(err);
    return res.status(500).send(`Server Error: ${err}`);
  }
}

const getMessagesForSidebar = async (req, res) => {
  try{
    const client = Auth.getClientEmail(req);
    console.log(`Getting messages for ${client}`);
    const messages = await MessageConnector.getLatestMessageFromEachConversation(client);
    return res.status(200).send(messages);
  }catch (err){
    console.error(err);
    return res.status(500).send(`Server Error: ${err}`);
  }
}

const getMessagesForFriend = async (req, res) => {
  try{
    const clientEmail = Auth.getClientEmail(req);
    const { friendEmail } = req.params;
    await setFriendMessagesToRead(clientEmail, friendEmail);
    console.log("set messages to read")
    console.log(`Getting messages for ${clientEmail}`);
    const messages = await MessageConnector.getFriendMessages(clientEmail, friendEmail);
    return res.status(200).send(messages);
  }catch (err){
    console.error(err);
    return res.status(500).send(`Server Error: ${err}`);
  }
}

const setFriendMessagesToRead = async (clientEmail, friendEmail) => {
  try{
    console.log(`Getting setting messages from ${friendEmail} to read by ${clientEmail}`);
    return await MessageConnector.setFriendMessageRead(clientEmail, friendEmail);
  }catch (err){
    console.error("Error setting messages to read");
    err;
  }
}

module.exports = {
  sendMessage,
  getMessages,
  getMessagesForSidebar,
  getMessagesForFriend
}
