// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// require('dotenv').config();

// mongoose.connect(process.env.MONGO_URI, {
// });

// const app = express();
// app.use(cors());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// require('./socket')(io);

// app.get("/", (req, res) => {
//   res.send("Skribbl clone backend is running.");
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();
const DRAW_TIME = 60 * 1000; // 1 minute in milliseconds
const MAX_PLAYERS_PER_ROOM = 8;

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRandomRoom", (userData) => {
    // Find an available room or create a new one
    let targetRoom = null;

    // Look for a room that's not full and has started
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.size < MAX_PLAYERS_PER_ROOM && room.gameStarted) {
        targetRoom = roomId;
        break;
      }
    }

    // If no suitable room found, create a new one
    if (!targetRoom) {
      targetRoom = Math.random().toString(36).substring(2, 8);
      rooms.set(targetRoom, {
        users: new Map(),
        paths: [],
        currentDrawer: null,
        timer: null,
        word: null,
        gameStarted: false,
        roundNumber: 0,
        timeLeft: DRAW_TIME,
      });
    }

    // Join the room
    socket.join(targetRoom);
    const room = rooms.get(targetRoom);
    const userId = userData.id;

    // Add user to room
    room.users.set(userId, {
      ...userData,
      socketId: socket.id,
      score: 0,
    });

    // If first user, make them the drawer and start the game
    if (room.users.size === 1) {
      room.gameStarted = true;
      startNewRound(targetRoom, userId);
    } else if (room.users.size >= 2 && !room.gameStarted) {
      // If second player joins, start the game
      room.gameStarted = true;
      const users = Array.from(room.users.keys());
      const newDrawer = users[Math.floor(Math.random() * users.length)];
      startNewRound(targetRoom, newDrawer);
    }

    // Send current state to new user
    socket.emit("roomState", {
      paths: room.paths,
      users: Array.from(room.users.values()),
      currentDrawer: room.currentDrawer,
      word: userId === room.currentDrawer ? room.word : null,
      canDraw: userId === room.currentDrawer,
      timeLeft: room.timeLeft,
      roundNumber: room.roundNumber,
    });

    // Notify others about new user
    socket.to(targetRoom).emit("userJoined", {
      id: userId,
      name: userData.name,
      avatar: userData.avatar,
      score: 0,
    });

    // Send room ID back to client
    socket.emit("roomJoined", targetRoom);
  });

  socket.on("draw", (data) => {
    const { roomId, path, userId } = data;
    const room = rooms.get(roomId);

    // Only allow drawing if user is the current drawer
    if (room && userId === room.currentDrawer) {
      room.paths.push(path);
      socket.to(roomId).emit("draw", path);
    }
  });

  socket.on("clear", (roomId, userId) => {
    const room = rooms.get(roomId);
    if (room && userId === room.currentDrawer) {
      room.paths = [];
      socket.to(roomId).emit("clear");
    }
  });

  socket.on("guess", (roomId, userId, guess) => {
    const room = rooms.get(roomId);
    if (!room || !room.word) return;

    const user = room.users.get(userId);
    if (!user || userId === room.currentDrawer) return;

    if (guess.toLowerCase() === room.word.toLowerCase()) {
      // Correct guess
      user.score += 100;
      socket.to(roomId).emit("correctGuess", {
        userId,
        username: user.name,
        score: user.score,
      });
      socket.emit("correctGuess", {
        userId,
        username: user.name,
        score: user.score,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // Find and remove disconnected user from rooms
    rooms.forEach((room, roomId) => {
      room.users.forEach((user, userId) => {
        if (user.socketId === socket.id) {
          room.users.delete(userId);
          io.to(roomId).emit("userLeft", userId);

          // If drawer left, select new drawer
          if (userId === room.currentDrawer) {
            const remainingUsers = Array.from(room.users.keys());
            if (remainingUsers.length > 0) {
              const newDrawer = remainingUsers[0];
              startNewRound(roomId, newDrawer);
            } else {
              // No users left, clean up room
              clearTimeout(room.timer);
              rooms.delete(roomId);
            }
          }
        }
      });
    });
  });

  function startNewRound(roomId, drawerId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // Clear previous timer
    if (room.timer) {
      clearTimeout(room.timer);
    }

    // Set new drawer and increment round
    room.currentDrawer = drawerId;
    room.paths = [];
    room.word = getRandomWord();
    room.roundNumber++;
    room.timeLeft = DRAW_TIME;

    // Start timer
    const timerInterval = setInterval(() => {
      room.timeLeft -= 1000;
      io.to(roomId).emit("timerUpdate", room.timeLeft);

      if (room.timeLeft <= 0) {
        clearInterval(timerInterval);
        endRound(roomId);
      }
    }, 1000);

    room.timer = timerInterval;

    // Notify all clients
    io.to(roomId).emit("newRound", {
      drawerId,
      word: room.word,
      timeLeft: DRAW_TIME,
      roundNumber: room.roundNumber,
    });
  }

  function endRound(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    // Clear canvas
    room.paths = [];
    io.to(roomId).emit("clear");

    // Select next drawer (round-robin)
    const users = Array.from(room.users.keys());
    const currentIndex = users.indexOf(room.currentDrawer);
    const nextDrawer = users[(currentIndex + 1) % users.length];

    startNewRound(roomId, nextDrawer);
  }

  function getRandomWord() {
    const words = ["Apple", "Banana", "Car", "Dog", "Elephant", "Flower"];
    return words[Math.floor(Math.random() * words.length)];
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
