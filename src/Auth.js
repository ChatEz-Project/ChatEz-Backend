const admin = require("firebase-admin");

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

    console.log(`Authenticating with token: ${idToken}`);
    const decodedToken = await admin.auth().verifyIdToken(idToken);

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