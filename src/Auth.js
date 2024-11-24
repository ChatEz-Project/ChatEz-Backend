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
    const authId = (await admin.auth().verifyIdToken(authHeader))
    const email = authId.email;
    const photoUrl = authId.picture;
    const authUserInfo = (await admin.auth().getUser(authId.uid));
    const displayName = authUserInfo.displayName;

    console.log(`Successfully Authenticated: ${email}`);

    req.userEmail = email;
    req.displayName = displayName;
    req.photoUrl = photoUrl;

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

const getClientEmail = (req) => {
  if (process.env.NODE_ENV === 'test') { //needed to switch between headers set by test and prod
    return req.headers.useremail //test header
  }else{
    return req.userEmail; //header when running normally
  }
}

module.exports = {
  verifyFirebaseToken,
  getClientEmail
};
