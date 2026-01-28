import { Server } from "socket.io";
import User from '../models/userModel.js'

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });


  let activeUsers = [];


  io.on("connection", (socket) => {

        socket.on("new-user-add", (newUserId) => {
            if (newUserId) {
              const existingUser = activeUsers.find((user) => user.userId === newUserId);
              
              if (existingUser) {
                existingUser.socketId = socket.id;
              } else {
                activeUsers.push({ userId: newUserId, socketId: socket.id });
              }
            }
            
            console.log("Current Online Users:", activeUsers);
            io.emit("get-users", activeUsers);
      });


    socket.on("send-message", (data) => {
      const { receiverId } = data;
      const user = activeUsers.find((u) => u.userId === receiverId);
      
      if (user) {

        io.to(user.socketId).emit("receive-message", data);

      }
    });


    socket.on("disconnect", async () => {

    const user = activeUsers.find((u) => u.socketId === socket.id);
  
    if (user) {

      await User.findByIdAndUpdate(user.userId, { lastSeen: new Date() });

      activeUsers = activeUsers.filter((u) => u.socketId !== socket.id);

      io.emit("get-users", activeUsers);
    }
  });
  
  });

  
  return io;
};