const express = require("express");
const userController = require("./src/user/Controller");
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const cors = require("cors");

// Load environment variables
const environment = process.env.NODE_ENV || 'prod';
dotenv.config({ path: `.env.${environment}` });

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid authorization header format, should be: Bearer <User ID token>" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Add the decoded token to the request object for use in route handlers
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000"
}));
app.use(express.json());
if (process.env.AUTH_ENABLED === "true") {
  app.use(verifyFirebaseToken)
}

// Routes
app.post("/addFriend/:email", userController.addFriend);

// Server start
if (require.main === module) {
  const PORT = process.env.RUN_ON_PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT} in ${environment}`);
  });
}

module.exports = app;
