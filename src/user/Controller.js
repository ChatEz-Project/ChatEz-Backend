const UserConnector = require("./MongoConnector");
const MessageController = require("../message/Controller");
const ProfilePhotoFirebaseStorageConnector = require("./FirebaseStorageConnector");
const { languageOptions } = require("./languagesOptions");
const User = require("./Model");
const Auth = require("../Auth");
const firebaseAdmin = require("../FirebaseAdmin").admin;

const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || "dev";
dotenv.config({ path: `.env.${environment}` });

const getUser = async (req, res) => {
  const { userEmail } = req.params;
  console.log(`Getting user ${userEmail}`);
  try {
    const user = await UserConnector.getUser(userEmail);
    if (user !== null) {
      return res.status(200).send(user);
    } else {
      return res.status(404).send("User not found");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server Error: ${err}` });
  }
};

const updateLastActive = async (req, res, next) => {
  const email = req.userEmail;
  const displayName = req.displayName;
  const photoUrl = req.photoUrl;

  try {
    const userModel = await UserConnector.getUser(email);
    if (userModel !== null) {
      userModel.lastActive = Date.now();
      const updatedUserModel = await UserConnector.updateLastActive(email);
      if (updatedUserModel !== null) {
        console.log(
          `LastActive for ${updatedUserModel.email} updated to ${updatedUserModel.lastActive}`
        );
      } else {
        console.error(`LastActive update for ${email} failed`);
      }
      next();
    } else {
      try {
        await addNewUser(email, displayName, photoUrl);
        next();
      } catch (err) {
        console.error(err);
      }
    }
  } catch (err) {
    throw err;
  }
};

const addNewUser = async (email, displayName, photoUrl) => {
  const insertedUser = await UserConnector.insertUser(
    new User({
      email: email,
      displayName: displayName,
      friendList: [email],
      photoUrl: photoUrl,
    })
  );
  console.log(
    `Inserted new user ${insertedUser.email} with lastActive: ${insertedUser.lastActive}`
  );
};

const makeFriends = async (req, res) => {
  const { friendEmail } = req.params;
  const clientEmail = Auth.getClientEmail(req);

  try {
    const client = await UserConnector.getUser(clientEmail);
    if (client == null) {
      return res.status(404).send(`Friend email: ${friendEmail} is not a user`);
    }
    if (client.friendList.includes(friendEmail)) {
      return res.status(400).send(`Already friends with ${friendEmail} <3`);
    }
    if (friendEmail === clientEmail) {
      return res.status(400).send(`Cannot add yourself as your friend`);
    }

    await addFriend(clientEmail, friendEmail);
    await addFriend(friendEmail, clientEmail);
    return res.status(200).send("Successfully made friends :)");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server Error: ${err}` });
  }
};

const addFriend = async (userEmail, friendEmail) => {
  const user = await UserConnector.getUser(userEmail);
  const result = await UserConnector.updateFriendList(
    userEmail,
    [...user.friendList, friendEmail].sort()
  );
  console.log(
    `added friend ${friendEmail} to ${userEmail}, friend list is now ${result.friendList}`
  );
  return result;
};

const breakFriends = async (req, res) => {
  const { friendEmail } = req.params;
  const clientEmail = Auth.getClientEmail(req);

  try {
    const client = await UserConnector.getUser(clientEmail);
    if (client == null) {
      return res.status(404).send(`Email: ${friendEmail} is not a user`);
    }
    if (!client.friendList.includes(friendEmail)) {
      return res.status(400).send(`Already NOT friends with ${friendEmail}`);
    }
    if (friendEmail === clientEmail) {
      return res.status(400).send(`Cannot unfriend yourself`);
    }

    await removeFriend(clientEmail, friendEmail);
    await removeFriend(friendEmail, clientEmail);
    return res.status(200).send("Successfully unfriended");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server Error: ${err}` });
  }
};

const removeFriend = async (userEmail, friendEmail) => {
  const user = await UserConnector.getUser(userEmail);
  const result = await UserConnector.updateFriendList(
    userEmail,
    user.friendList.filter((friend) => friend !== friendEmail)
  );
  console.log(
    `removed ${friendEmail} from ${userEmail}, friend list is now ${result.friendList}`
  );
  return result;
};

const getFriends = async (req, res) => {
  const email = Auth.getClientEmail(req);

  try {
    const user = await UserConnector.getUser(email);
    const friends = await UserConnector.getFriendListUsers(user.friendList);
    return res.status(200).send(friends);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server Error: ${err}` });
  }
};

const setProfilePhoto = async (req, res) => {
  const userEmail = Auth.getClientEmail(req);
  try {
    const profilePhoto = req.file;

    if (!profilePhoto) {
      return res.status(400).send("Must contain <file:> field in body");
    }

    const fileExtension = profilePhoto.originalname
      .split(".")
      .pop()
      .toLowerCase();

    if (
      !(
        fileExtension === "png" ||
        fileExtension === "jpg" ||
        fileExtension === "gif"
      )
    ) {
      return res.status(400).send(`Profile photo must be .jpg or .png or .gif`);
    }

    const user = await UserConnector.getUser(userEmail);

    await ProfilePhotoFirebaseStorageConnector.deletePhoto(user.photoUrl);

    const photoUrl = await ProfilePhotoFirebaseStorageConnector.uploadPhoto(
      profilePhoto,
      user.email
    );
    console.log(`Stored photo to firebase ${photoUrl}`);
    await UserConnector.updatePhotoUrl(userEmail, photoUrl);

    return res.status(200).send("Successfully saved new profile photo");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server Error: ${err}` });
  }
};

const setDisplayName = async (req, res) => {
  const email = Auth.getClientEmail(req);
  const displayName = req.body.displayName;

  if (!displayName) {
    return res.status(400).send("Must contain <displayName:> field in body");
  }

  try {
    await UserConnector.updateDisplayName(email, displayName);
    return res.status(200).send("Successfully set display name");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server Error: ${err}` });
  }
};

const setLanguage = async (req, res) => {
  const email = Auth.getClientEmail(req);
  const language = req.body.language;

  if (!language) {
    return res.status(400).send("Must contain <language:> field in body");
  }

  // Check if the language exists in languageOptions
  const isLanguageValid = languageOptions.some(
    (option) => option.code === language
  );

  if (!isLanguageValid) {
    return res.status(400).send("Invalid language code");
  }

  if (language)
    try {
      await UserConnector.updateLanguage(email, language);
      return res.status(200).send("Successfully set language");
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: `Server Error: ${err}` });
    }
};

const deleteUser = async (req, res) => {
  try {
    const userEmail = Auth.getClientEmail(req);
    const userToDelete = await UserConnector.getUser(userEmail);
    await MessageController.messageDeletionPipeline(userEmail);
    console.log("User deletion pipeline: deleted messages");

    await ProfilePhotoFirebaseStorageConnector.deletePhoto(
      userToDelete.photoUrl
    );
    console.log("User deletion pipeline: deleted photo");

    await UserConnector.deleteUser(userEmail);
    console.log("User deletion pipeline: deleted user db entry");

    try {
      const firebaseAuthUser = await firebaseAdmin
        .auth()
        .getUserByEmail(userEmail);
      await firebaseAdmin.auth().deleteUser(firebaseAuthUser.uid);
      console.log("User deletion pipeline: deleted firebase auth user");
    } catch {
      console.log(
        "User deletion pipeline: failed to delete firebase auth user - ignore this if test"
      );
    }

    return res.status(200).send("Successfully deleted user");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Server Error: ${err}` });
  }
};

module.exports = {
  getUser,
  updateLastActive,
  makeFriends,
  breakFriends,
  getFriends,
  setProfilePhoto,
  deleteUser,
  setDisplayName,
  setLanguage,
};
