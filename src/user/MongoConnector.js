const accessSecret = require("../SecretManager");
const User = require("./Model");

const dotenv = require("dotenv");
const mongoose = require("mongoose");

const environment = process.env.NODE_ENV || "dev";
dotenv.config({ path: `.env.${environment}` });

async function connectToDatabase() {
  try {
    const mongoPassword = await accessSecret(
      `Mongo_${process.env.MONGO_USERNAME}`
    );
    const dbURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${mongoPassword}@chatez.9mxcu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=ChatEz`;
    await mongoose.connect(dbURI, {
      maxPoolSize: process.env.MONGO_MAX_CONNECTIONS,
    });
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

async function getUser(email) {
  try {
    return await User.findOne({ email: email });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function insertUser(userModel) {
  try {
    return await userModel.save();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updateUser(userModel) {
  try {
    return await User.findOneAndUpdate(
      { email: userModel.email },
      {
        displayName: userModel.displayName,
        lastActive: userModel.lastActive,
        language: userModel.language,
        friendList: userModel.friendList,
        photoUrl: userModel.photoUrl,
      },
      { new: true }
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updateLastActive(email) {
  try {
    return await User.findOneAndUpdate(
      { email: email },
      { lastActive: Date.now() },
      { new: true }
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updateFriendList(email, friendList) {
  try {
    return await User.findOneAndUpdate(
      { email: email },
      { friendList: friendList },
      { new: true }
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updatePhotoUrl(email, photoUrl) {
  try {
    return await User.findOneAndUpdate(
      { email: email },
      { photoUrl: photoUrl },
      { new: true }
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function updateDisplayName(email, displayName) {
  try {
    return await User.findOneAndUpdate(
      { email: email },
      { displayName: displayName },
      { new: true }
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getFriendListUsers(friendList) {
  try {
    return await User.find({ email: { $in: friendList } });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function testOnlyDeleteAll() {
  try {
    return await User.deleteMany();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

connectToDatabase().then((_) =>
  console.log("User database connector initialised")
);

module.exports = {
  getUser,
  insertUser,
  updateUser,
  updateFriendList,
  updateLastActive,
  getFriendListUsers,
  updatePhotoUrl,
  updateDisplayName,
  testOnlyDeleteAll,
  connectToDatabase,
};
