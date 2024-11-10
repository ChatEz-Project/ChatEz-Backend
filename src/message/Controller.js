const MessageConnector = require("./MongoConnector");
const FirebaseStorageConnector = require("./FirebaseStorageConnector");
const UserConnector = require("../user/Connector");
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
      console.log(`uploaded file: ${fileUrl}`);
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

module.exports = {
  sendMessage,
  getMessages
}
