const UserController = require("./user/Controller");
const Auth = require("./Auth");

const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");

const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const app = express();


// Middleware
app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT}`,
}));
app.use(express.json());
if (process.env.AUTH_ENABLED === "true") {
  app.use(Auth.verifyFirebaseToken) //this triggers implicit user status update
}


// Routes
app.post("/addFriend/:email", UserController.addFriend);
app.patch("/checkUserExists/:email", UserController.userExists)


// Server start
if (require.main === module) {
  const PORT = process.env.RUN_ON_PORT;
  app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT} in ${environment} mode`);
  });
}

module.exports = app;
