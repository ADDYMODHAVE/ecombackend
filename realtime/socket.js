const { Server } = require("socket.io");

function socket_io(server) {
  console.log("Socket connected");
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // Store connected users
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("newuser", (name) => {
      connectedUsers.set(socket.id, name);
      socket.emit("group", `${name} joined`);
      socket.broadcast.emit("group", `${name} joined`);
    });

    // Handle incoming messages
    socket.on("message", (data) => {
      // Broadcast message to all clients
      io.emit("group", data);

      // Simulate admin reply after 1-2 seconds
      // if (data.sender === "user") {
      //   setTimeout(() => {
      //     const adminReply = {
      //       text: `Thank you for your message: "${data.text}". This is an automated reply from the support team.`,
      //       sender: "admin",
      //       timestamp: new Date().toISOString(),
      //     };
      //     io.emit("group", adminReply);
      //   }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
      // }
    });

    // Handle typing status
    socket.on("typing", (status) => {
      socket.broadcast.emit("typing", status);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const userName = connectedUsers.get(socket.id);
      if (userName) {
        io.emit("group", `${userName} left`);
        connectedUsers.delete(socket.id);
      }
      console.log("A user disconnected:", socket.id);
    });
  });

  // Function to send admin message
  const sendAdminMessage = (message) => {
    const adminMessage = {
      text: message,
      sender: "admin",
      timestamp: new Date().toISOString(),
    };
    io.emit("group", adminMessage);
  };

  // Function to get connected users count
  const getConnectedUsersCount = () => {
    return connectedUsers.size;
  };

  // Function to get connected users list
  const getConnectedUsers = () => {
    return Array.from(connectedUsers.values());
  };

  return {
    sendAdminMessage,
    getConnectedUsersCount,
    getConnectedUsers,
  };
}

module.exports = socket_io;
