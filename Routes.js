const express = require("express");
const userController = require("./src/user/Controller");
const routes = express();

// Define routes
routes.post("/addFriend/:email", userController.addFriend);

// Only call listen() when running the app directly
if (require.main === module) {
    const PORT = 8080;
    routes.listen(PORT, () => {
        console.log(`Server started on port http://localhost:${PORT}`);
    });
}

module.exports = routes; // Export the app (without starting the server)
