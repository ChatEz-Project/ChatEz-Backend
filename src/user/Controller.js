const UserConnector = require("./Connector");
const User = require("./Model")

const dotenv = require('dotenv');
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

const getUser = async (req, res) => {
  const email = getClientEmail(req)

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
      const updatedUserModel = await UserConnector.updateLastActive(email)
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

const makeFriends = async (req, res) => {
  const { friendEmail } = req.params;
  const clientEmail = getClientEmail(req);
  // const friendEmail = req.query.email

  try{
    const client = await UserConnector.getUser(clientEmail);
    if (client == null){
      return res.status(404).send(`Friend email: ${friendEmail} is not a user`);
    }
    if(client.friendList.includes(friendEmail)){
      return res.status(400).send(`Already friends with ${friendEmail} <3`);
    }
    if(friendEmail == clientEmail){
      return res.status(400).send(`Cannot add yourself as your friend`);
    }

    await addFriend(clientEmail, friendEmail);
    await addFriend(friendEmail, clientEmail);
    return res.status(200).send("Successfully made friends :)");

  }catch (err) {
    console.error(err);
    return res.status(400).json({ error: `Server Error: ${err}` });
  }
}

const addFriend = async (userEmail, friendEmail) => {
  const user = await UserConnector.getUser(userEmail)
  const result = await UserConnector.updateFriendList(userEmail, [...user.friendList, friendEmail].sort())
  console.log(`added ${friendEmail} to ${userEmail}, friend list is now ${result.friendList}`)
  return result
}

const getClientEmail = (req) => {
  if (process.env.NODE_ENV === 'test') { //needed to switch between headers set by test and prod
    return req.headers.useremail
  }else{
    return req.userEmail;
  }
}

module.exports = {
  getUser,
  updateLastActive,
  makeFriends
};
