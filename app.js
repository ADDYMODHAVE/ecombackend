const express = require("express");
const dotenv = require("dotenv");
const http = require("http");

const socket_io = require("./realtime/socket");
const connectToDb = require("./database/db");
const serverMiddleware = require("./server-middleware");
const routes = require("./routes");
const { initAWS } = require("./config/aws");

dotenv.config();

const app = express();
const server = http.createServer(app);

serverMiddleware(app);
socket_io(server);
connectToDb();
initAWS();

// Routes
app.use("/api", routes);

// Default route
app.use((req, res) => {
  res.status(200).send("Welcome to the API");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
