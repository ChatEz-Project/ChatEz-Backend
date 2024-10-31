const mongoose = require('mongoose');
const Schema = mongoose.Schema

const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const userSchema = new Schema({
  email      : {type: String, required: true, unique: true},
  displayName: {type: String, default: function() { return this.email; }},
  lastActive : {type: Date  , default: Date.now},
  language   : {type: String, default: process.env.DEFAULT_LANGUAGE},
  friendList : {type: Array , default: []},
  photoUrl   : {type: String, default: `${process.env.DEFAULT_PROFILE_IMAGE}`},
});

const User = mongoose.model('User', userSchema);

module.exports = User;