const UserConnector = require("./Connector");

const addFriend = (req, res) => {
  const { email } = req.params;

  if (!email.includes("@")) {
    return res.status(400).send({ message: "email must contain @" });
  }

  return res.send({ "email": `you have a friend?? ${email}` });
};

const userExists = (req, res) => {
  const {email} = req.params;
  return res.status(200).send({message: UserConnector.userExists(email)});
}

module.exports = {
  addFriend
  , userExists
};
