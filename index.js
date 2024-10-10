const express = require("express");
const app = express();
const PORT = 8080;

app.listen(
    PORT,
    () => console.log(`Server started on port http://localhost:${PORT}`)
);

app.post("/addFriend/:email", (req, res) => {
    const { email } = req.params;

    if (!email.includes("@")){
        res.status(400).send({message: "email must contain @"});
    } else {
        res.send({"email": `you have a friend?? ${email}`});
    }
});