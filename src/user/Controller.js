const UserConnector = require("./Connector");

const addFriend = (req, res) => {
  const { email } = req.params;

  if (!email.includes("@")) {
    return res.status(400).send({ message: "email must contain @" });
  }

  return res.send({ "email": `you have a friend?? ${email}` });
};

const userExists = async (req, res) => {
  try {
    const {email} = req.params;
    const userExists = await UserConnector.userExists(email);
    return res.status(200).send({message: userExists});
  } catch (error) {
    throw error;
  }
}

module.exports = {
  addFriend
  , userExists
};
