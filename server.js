const express = require("express");
const bodyParser = require("body-parser");
var path = require("path");
var cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/auth-routes");
const http = require("http");
const socketio = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const authService = require("./auth/auth-service");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// AUTH ROUTE
app.use("/auth", authRoutes);

//FRONTEND
app.use(express.static(path.join(__dirname, "static")));

//SOCKET CONNECTION
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origins: ["*"],
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});
const pubClient = createClient({ host: "localhost", port: 6379 });
const subClient = pubClient.duplicate();
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});

//SOCKET LOGIC
io.use(function (socket, next) {
  if (socket.handshake.query) {
    const decoded = jwt.verify(socket.handshake.query["auth"], "super-secret");
    if (!decoded) return next(new Error("Authentication error!"));
    user = authService.validateUser(decoded.username);
    if (!user) {
      next(new Error("Authentication error!"));
    }
    next();
  } else {
    next(new Error("Authentication error!"));
  }
}).on("connection", function (socket) {
  // Connection now authenticated to receive further events
  socket.on("joinRoom", function (room) {
    socket.join(room);
    console.log("User joined!");
  });

  socket.on("msgToServer", function (msg) {
    io.to("general").emit("msgToClient", msg);
  });

  socket.on("leaveRoom", function (room) {
    socket.leave(room);
  });
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

//SERVER STARTUP
const PORT = 3000;
server.listen(PORT, (error) => {
  if (!error) console.log("App is listening on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
