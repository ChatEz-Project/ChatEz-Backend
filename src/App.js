const UserController = require("./user/Controller");
const Auth = require("./Auth");

const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");

// Load environment variables
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT}`,
}));
app.use(express.json());
if (process.env.AUTH_ENABLED === "true") {
  app.use(Auth.verifyFirebaseToken)
}

// Routes
app.post("/addFriend/:email", UserController.addFriend);

// Server start
if (require.main === module) {
  const PORT = process.env.RUN_ON_PORT;
  app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT} in ${environment} mode`);
  });
}

module.exports = app;
