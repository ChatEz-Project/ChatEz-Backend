const MessageConnector = require("./MongoConnector");
const FirebaseStorageConnector = require("./FirebaseStorageConnector");
const Message = require("./Model")
const Auth = require("../Auth");

const dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const sendMessage = async (req, res) => {
  const sender = Auth.getClientEmail(req);

  try{
    const { recipient } = req.params;
    const messageContent = req.body.message;

    let fileRef = null;
    if(req.file != null){
      fileRef = await FirebaseStorageConnector.uploadFileToFirebase(req.file, sender);
      console.log(fileRef);
    }

    const message = new Message({
      sender: sender,
      recipient: recipient,
      fileRef: fileRef,
      message: messageContent
    })

    await MessageConnector.storeNewMessage(message)
    res.status(200).send("Message sent successfully");
  }catch(err){
    res.status(500).send(`Server Error: ${err}`);
  }
}

module.exports = {
  sendMessage,
}