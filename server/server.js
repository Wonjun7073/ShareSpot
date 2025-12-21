
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("접속됨:", socket.id);


  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined ${roomId}`);
  });


   socket.on("chat", ({ roomId, message }) => {
    io.to(roomId).emit("receiveMessage", {
      sender: socket.id,
      message
    });
  });

  socket.on("disconnect", () => {
    console.log("연결 종료:", socket.id);
  });
});

server.listen(10001, () => {
  console.log("서버 실행: http://localhost:10001");
});