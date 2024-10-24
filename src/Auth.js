const admin = require("firebase-admin");
const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

// Initialize Firebase
admin.initializeApp({
  projectId: process.env.PROJECT_ID,
  credential: admin.credential.applicationDefault()
});

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    console.log(`Authenticating with token: ${authHeader}`);
    const decodedToken = await admin.auth().verifyIdToken(authHeader);

    // Add the decoded token to the request object for use in route handlers
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = {
  verifyFirebaseToken
};
