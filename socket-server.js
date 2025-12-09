const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { Client } = require('pg');

// 🔥 Създаваме HTTP сървър (НЕ express)
const server = http.createServer();

// PostgreSQL configuration
const dbConfig = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '0341264008v',
  database: 'chat_app_db'
};

async function updateUserStatus(userId, status) {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query(
      'UPDATE users SET status = $1, last_seen = NOW() WHERE id = $2',
      [status, userId]
    );
  } catch (err) {
    console.error('Failed to update user status:', err);
  } finally {
    await client.end();
  }
}

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🔐 Твоят JWT SECRET от Adonis 4 → APP_KEY
const JWT_SECRET = "kJ2rtYH77lOgBkXaS1CQ0wbRDO7P8bmA";

// 💾 Памет за юзери
const onlineUsers = new Map(); // userId -> { socketId, status }

/*
|--------------------------------------------------------------------------
|   AUTHENTICATION MIDDLEWARE
|--------------------------------------------------------------------------
*/
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.uid || decoded.id || decoded.user_id;
    if (!userId) {
      return next(new Error("Invalid token payload"));
    }

    // Fetch user info for username/nickname (for typing + display)
    const client = new Client(dbConfig);
    await client.connect();
    const userRes = await client.query(
      'SELECT id, username, email FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );
    await client.end();

    const row = userRes.rows[0] || {};

    socket.user = {
      id: userId,
      username: row.username || row.email || `user_${userId}`
    };

    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
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
  onlineUsers.set(socket.user.id, { socketId: socket.id, status: 'online' });

  // Update database
  updateUserStatus(socket.user.id, 'online');

  // 🟢 Изпращаме на всички, че юзър е онлайн
  io.emit("user:status", { userId: socket.user.id, status: 'online' });

  /*
  |--------------------------------------------------------------------------
  |   DYNAMIC MESSAGE LISTENER (chat:CHANNEL_ID:message)
  |--------------------------------------------------------------------------
  */
  socket.onAny((eventName, data) => {
    // Handle chat:N:message events
    if (eventName.match(/^chat:\d+:message$/)) {
      const channelId = eventName.split(':')[1];
      console.log(`📨 Message in channel ${channelId}:`, data);
      
      // Broadcast to all in this channel - DON'T override user info from message!
      // The message already has user_id and user object from frontend/API
      io.emit(eventName, data);
    }
    // Handle chat:N:typing events
    else if (eventName.match(/^chat:\d+:typing$/)) {
      const channelId = eventName.split(':')[1];
      console.log(`⌨️  User ${socket.user.id} typing in channel ${channelId}`);
      
      // Broadcast to all in this channel (include current message text for preview)
      io.emit(eventName, {
        ...data,
        user_id: socket.user.id,
        username: socket.user.username || 'Unknown',
        message: data.message || '' // Current typing text for real-time preview
      });
    }
  });

  /*
  |--------------------------------------------------------------------------
  |   JOIN ROOM (backward compatibility)
  |--------------------------------------------------------------------------
  */
  socket.on("room:join", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.id} joined room ${roomId}`);
  });

  /*
  |--------------------------------------------------------------------------
  |   SEND MESSAGE (backward compatibility)
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
  |   USER TYPING (backward compatibility)
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
  |   STATUS CHANGE
  |--------------------------------------------------------------------------
  */
  socket.on("status:change", ({ status }) => {
    console.log(`User ${socket.user.id} changed status to: ${status}`);
    
    const validStatuses = ['online', 'dnd', 'offline'];
    if (!validStatuses.includes(status)) {
      console.error('Invalid status:', status);
      return;
    }

    // Update in memory
    const userData = onlineUsers.get(socket.user.id);
    if (userData) {
      userData.status = status;
      onlineUsers.set(socket.user.id, userData);
    }

    // Update database
    updateUserStatus(socket.user.id, status);

    // Broadcast to all users
    io.emit("user:status", { userId: socket.user.id, status });
  });

  /*
  |--------------------------------------------------------------------------
  |   DISCONNECT
  |--------------------------------------------------------------------------
  */
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user.id);

    onlineUsers.delete(socket.user.id);

    // Update database
    updateUserStatus(socket.user.id, 'offline');

    io.emit("user:status", { userId: socket.user.id, status: 'offline' });
  });
});

// 🔥 СТАРТИРАМЕ СЪРВЪРА
server.listen(3334, () => {
  console.log("🔥 Socket.IO server running on :3334");
});
