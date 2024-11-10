const mongoose = require('mongoose');
const Schema = mongoose.Schema

const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const messageSchema = new Schema({
  sender   : {type: String,  required:true},
  recipient: {type: String,  required:true},
  dateSent : {type: Date,    default: Date.now},
  read     : {type: Boolean, default: false},
  fileUrl  : {type: String},
  message  : {type: String,  required: true}
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;