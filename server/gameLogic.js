// gameLogic.js
const redis = require("./redisClient");
const Room = require("./models/room.model");
const Word = require("./models/word.model");
const { v4: uuidv4 } = require("uuid");

// Create a new game room
async function createRoom(socketId, username, avatar) {
  const roomCode = uuidv4().split("-")[0].toUpperCase(); // Generate a unique room code
  const room = {
    roomCode,
    players: [
      {
        socketId,
        username,
        avatar,
        score: 0,
        isDrawer: true,
      },
    ],
    currentWord: "",
    round: 1,
    maxRounds: 5,
    isGameActive: false,
    turnIndex: 0,
  };

  // Store room in Redis
  await redis.set(`room:${roomCode}`, JSON.stringify(room));
  // Store game state in Redis under the correct key
  await redis.set(`gameState:${roomCode}`, JSON.stringify(room));
  return roomCode;
}

// Join an existing room
async function joinRoom(roomCode, socketId, username, avatar) {
  const roomData = await redis.get(`room:${roomCode}`);

  if (!roomData) return null; // Return null if the room doesn't exist

  const room = JSON.parse(roomData);

  // Add new player to room
  room.players.push({
    socketId,
    username,
    avatar,
    score: 0,
    isDrawer: false,
  });

  // Save updated room state back to Redis
  await redis.set(`room:${roomCode}`, JSON.stringify(room));
  return room;
}

// Start the game
async function startGame(roomCode, io) {
  const roomData = await redis.get(`room:${roomCode}`);
  const room = JSON.parse(roomData);

  if (room.isGameActive) return; // Game already started

  room.isGameActive = true;
  await redis.set(`room:${roomCode}`, JSON.stringify(room)); // Save to Redis

  // Emit the initial game state
  io.to(roomCode).emit("game_state_update", {
    ...room,
    currentDrawer: room.players[room.turnIndex], // Ensure currentDrawer is included
  });

  // Start the first round
  handleRound(roomCode, io);
}

// Handle game rounds (changing drawer)
async function handleRound(roomCode, io) {
  const roomData = await redis.get(`room:${roomCode}`);
  const room = JSON.parse(roomData);

  if (room.round > room.maxRounds) {
    io.to(roomCode).emit("game-over", { message: "Game Over!" });
    return;
  }

  const drawer = room.players[room.turnIndex];
  room.currentWord = await getRandomWord(); // Get word from MongoDB or a predefined list
  room.turnIndex = (room.turnIndex + 1) % room.players.length; // Move to next player
  room.round += 1;

  await redis.set(`room:${roomCode}`, JSON.stringify(room)); // Save updated room to Redis

  // Emit the updated game state
  io.to(roomCode).emit("game_state_update", {
    ...room,
    currentDrawer: drawer, // Ensure currentDrawer is included
  });

  io.to(roomCode).emit("round-start", {
    drawer: drawer.username,
    word: room.currentWord,
  });
}

// Get a random word from the MongoDB word collection
async function getRandomWord() {
  const words = await Word.find(); // Get words from MongoDB
  return words[Math.floor(Math.random() * words.length)].text;
}

async function endGame(roomCode) {
  await redis.del(`room:${roomCode}`); // Delete room data from Redis
  io.to(roomCode).emit("game-over", { message: "Game Over!" });
}

module.exports = { createRoom, joinRoom, startGame, handleRound, endGame };
