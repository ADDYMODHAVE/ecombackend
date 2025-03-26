const { Server } = require("socket.io");

function socket_io(server) {
  console.log("Socket connected");
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("newuser", (name) => {
      socket.emit("group", `${name} joined`);
      socket.broadcast.emit("group", `${name} joined`);
    });

    socket.on("message", (data) => {
      socket.emit("group", data);
      socket.broadcast.emit("group", data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}

module.exports = socket_io;
