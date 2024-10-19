const express = require("express");
const userController = require("./src/user/Controller");
const routes = express();

const cors = require("cors");
routes.use(cors()); // Enable CORS for all routes
routes.use(express.json()); // Middleware to parse JSON request bodies

// Define routes
routes.post("/addFriend/:email", userController.addFriend);

// Only call listen() when running the app directly
if (require.main === module) {
  const PORT = 8080;
  routes.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}`);
  });
}

routes.use(
  cors({
    origin: "http://localhost:3000", // Allow only this origin
  })
);

module.exports = routes; // Export the app (without starting the server)
