const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// 🔥 Създаваме HTTP сървър (НЕ express)
const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🔐 Твоят JWT SECRET от Adonis 4 → APP_KEY
const JWT_SECRET = "kJ2rtYH77lOgBkXaS1CQ0wbRDO7P8bmA";

// 💾 Памет за юзери
const onlineUsers = new Map();

/*
|--------------------------------------------------------------------------
|   AUTHENTICATION MIDDLEWARE
|--------------------------------------------------------------------------
*/
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    socket.user = {
      id: decoded.uid || decoded.id || decoded.user_id
    };

    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

/*
|--------------------------------------------------------------------------
|   SOCKET CONNECTION
|--------------------------------------------------------------------------
*/
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "UID:", socket.user.id);

  // Добавяме в списъка с онлайн потребители
  onlineUsers.set(socket.user.id, socket.id);

  // 🟢 Изпращаме на всички, че юзър е онлайн
  io.emit("user:online", socket.user.id);

  /*
  |--------------------------------------------------------------------------
  |   JOIN ROOM
  |--------------------------------------------------------------------------
  */
  socket.on("room:join", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.id} joined room ${roomId}`);
  });

  /*
  |--------------------------------------------------------------------------
  |   SEND MESSAGE
  |--------------------------------------------------------------------------
  */
  socket.on("message:send", (data) => {
    const { roomId, message } = data;

    const payload = {
      senderId: socket.user.id,
      message,
      timestamp: Date.now()
    };

    // Изпращаме само в тази стая
    io.to(roomId).emit("message:new", payload);
  });

  /*
  |--------------------------------------------------------------------------
  |   USER TYPING
  |--------------------------------------------------------------------------
  */
  socket.on("typing", ({ roomId, isTyping }) => {
    socket.to(roomId).emit("typing", {
      userId: socket.user.id,
      isTyping
    });
  });

  /*
  |--------------------------------------------------------------------------
  |   DISCONNECT
  |--------------------------------------------------------------------------
  */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.id);

    onlineUsers.delete(socket.user.id);

    io.emit("user:offline", socket.user.id);
  });
});

// 🔥 СТАРТИРАМЕ СЪРВЪРА
server.listen(3334, () => {
  console.log("🔥 Socket.IO server running on :3334");
});
