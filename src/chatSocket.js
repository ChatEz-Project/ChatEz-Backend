const { io } = require("./App");

// Utility to create consistent room IDs
const createRoomId = (userId, friendId) => {
  const sorted = [userId, friendId].sort();
  return `${sorted[0]}&${sorted[1]}`;
};

// Track user rooms and connections
const userRooms = new Map(); // userId -> Set of rooms
const userSockets = new Map(); // userId -> Set of socketIds

io.use(async (socket, next) => {
  const user = socket.handshake.headers.user;
  const friend = socket.handshake.headers.friend;

  if (!user || !friend) {
    return next(new Error("Missing user or friend ID"));
  }

  try {
    socket.data.user = user;
    socket.data.friend = friend;
    socket.data.room = createRoomId(user, friend);
    next();
  } catch (error) {
    next(new Error("Invalid connection parameters"));
  }
});

io.on("connection", (socket) => {
  const { user, friend, room } = socket.data;
  console.log(`User ${user} connected to room ${room}`);
  console.log(`Friend ${friend} connected to room ${room}`);

  // Add user to room tracking
  if (!userRooms.has(user)) {
    userRooms.set(user, new Set());
  }
  userRooms.get(user).add(room);

  // Track socket connections
  if (!userSockets.has(user)) {
    userSockets.set(user, new Set());
  }
  userSockets.get(user).add(socket.id);

  // Join the room
  socket.join(room);

  // Notify room of user's online status
  socket.to(room).emit("user_online", { userId: user });

  // Handle new message notifications
  socket.on("message_sent", () => {
    socket.to(room).emit("message_received");
  });

  socket.on("disconnect", () => {
    console.log(`User ${user} disconnected from room ${room}`);
    // Remove from tracking
    userSockets.get(user)?.delete(socket.id);
    if (userSockets.get(user)?.size === 0) {
      userSockets.delete(user);
      socket.to(room).emit("user_offline", { userId: user });
    }

    userRooms.get(user)?.delete(room);
    if (userRooms.get(user)?.size === 0) {
      userRooms.delete(user);
    }
  });
});
