// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { v4: uuidv4 } = require("uuid"); // Import uuid library for generating unique IDs

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

// This object will store the user IDs associated with their socket connections
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  // Generate a unique ID for the connected user
  const userId = uuidv4();
  connectedUsers[userId] = socket;

  socket.on("disconnect", () => {
    console.log("User disconnected");
    delete connectedUsers[userId]; // Remove the user from the connected users object on disconnect
  });

  socket.on("comment", (data) => {
    // Retrieve the post owner's user ID from the database (replace this with your database logic)
    const postOwnerId = "replace_with_post_owner_id"; // You need to implement the logic to retrieve this from your database

    // Check if the post owner is connected
    if (connectedUsers[postOwnerId]) {
      connectedUsers[postOwnerId].emit("commentNotification", data); // Send notification to the post owner
    }
  });

  socket.on("like", (data) => {
    // Retrieve the post owner's user ID from the database (replace this with your database logic)
    const postOwnerId = "replace_with_post_owner_id"; // You need to implement the logic to retrieve this from your database

    // Check if the post owner is connected
    if (connectedUsers[postOwnerId]) {
      connectedUsers[postOwnerId].emit("likeNotification", data); // Send notification to the post owner
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
