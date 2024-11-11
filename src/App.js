const UserController = require("./user/Controller");
const MessagesController = require("./message/Controller");
const Auth = require("./Auth");
const logRequest = require("./ReqLogger");

const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");
const multer = require('multer');
require('console-stamp')(console, '[HH:MM:ss.l]');

const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: process.env.FILEUPLOAD_SIZE_LIMIT_MB * 1024 * 1024, // 5MB limit
  }
}).single("file");

// Middleware
app.use(logRequest);
app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT}`,
}));
app.use(express.json());
app.use(upload)
app.use(express.urlencoded({ extended: true }));
if(process.env.ENABLE_CUSTOM_MIDDLEWARE == "true") {
  app.use(Auth.verifyFirebaseToken)
  app.use(UserController.updateLastActive)
}


// Routes
app.patch("/getUser", UserController.getUser);

app.patch("/addFriend/:friendEmail"   , UserController.makeFriends); //will friend both instantly
app.patch("/getFriends"               , UserController.getFriends);
app.patch("/removeFriend/:friendEmail", UserController.breakFriends);

app.post("/setProfilePhoto", UserController.setProfilePhoto); //body <file:> field must contain .jpg or .png or .gif file

app.post("/sendMessage/:recipient", MessagesController.sendMessage); //body must contain <message:> field and optional <file:> field
app.patch("/getMessages",           MessagesController.getMessages);


// Server start
if (require.main === module) {
  const PORT = process.env.RUN_ON_PORT;
  app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT} in ${environment} mode`);
  });
}

module.exports = app;
