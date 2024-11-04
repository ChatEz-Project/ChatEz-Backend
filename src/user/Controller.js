const UserConnector = require("./Connector");
const User = require("./Model")

const dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const getUser = async (req, res) => {
  let email;
  if (process.env.NODE_ENV === 'test') { //needed to switch between headers set by test and prod
    email = req.headers.useremail
  }else{
    email = req.userEmail;
  }

  console.log(`Getting user ${email}`);

  try {
    const user = await UserConnector.getUser(email)
    if (user !== null ) {
      return res.status(200).send(user);
    } else {
      return res.status(404).send("User not found");
    }
  }catch(err) {
    console.error(err);
    return res.status(400).json({ error: `Server Error: ${err}` });
  }
};

const updateLastActive = async (req, res, next) => {
  const email = req.userEmail //acquired from auth
  try {
    const userModel = await UserConnector.getUser(email)
    if ((userModel !== null)) {
      userModel.lastActive = Date.now();
      const updatedUserModel = await UserConnector.updateUser(userModel)
      if(updatedUserModel !== null){
        console.log(`LastActive for ${updatedUserModel.email} updated to ${updatedUserModel.lastActive}`)
      }else{
        console.error(`LastActive update for ${email} failed`)
      }
      next()
    } else{
      try{
        const insertedUser = await UserConnector.insertUser(new User({email: email}))
        console.log(`Inserted new user ${insertedUser.email} with lastActive: ${insertedUser.lastActive}`)
        next()
      }catch(err){
        throw err
      }
    }
  } catch (err) {
    throw err
  }
}

module.exports = {
  getUser,
  updateLastActive
};
