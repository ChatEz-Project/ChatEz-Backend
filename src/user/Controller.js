const addFriend = (req, res) => {
  const { email } = req.params;

  if (!email.includes("@")) {
    return res.status(400).send({ message: "email must contain @" });
  }

  return res.send({ "email": `you have a friend?? ${email}` });
};

module.exports = {
  addFriend
};
