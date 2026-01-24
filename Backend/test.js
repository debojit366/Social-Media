// index.js (Backend)
import { Server } from "socket.io";

const io = new Server(server, {
  cors: { origin: "http://localhost:5173" } // Aapka frontend URL
});

let activeUsers = [];

io.on("connection", (socket) => {
  // Jab user online aaye
  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }
    io.emit("get-users", activeUsers);
  });

  // Message bhejne ka logic
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-users", activeUsers);
  });
});