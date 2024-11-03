const admin = require("./FirebaseAdmin").admin;
const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    console.log(`Authenticating incoming request with token: ${authHeader}`);
    const email = (await admin.auth().verifyIdToken(authHeader)).email;
    console.log(`Successfully Authenticated: ${email}`);
    // Add the decoded token to the request object for use in route handlers
    req.userEmail = email;

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = {
  verifyFirebaseToken
};
