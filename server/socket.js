// const { createRoom, joinRoom, removePlayer } = require("./rooms");
const {
  createRoom,
  joinRoom,
  //   removePlayer,
  //   getCurrentRoom,
  startGame,
  handleRound,
} = require("./gameLogic");
const Word = require("./models/word.model");
const redis = require("./redisClient");

module.exports = (io) => {
  io.on("connection", (socket) => {
    const { username, avatar } = socket.handshake.query;
    console.log(
      "User connected:",
      socket.id,
      "Username:",
      username,
      "Avatar:",
      avatar
    );

    // Emit an acknowledgment or initial state to the client
    socket.emit("connected", {
      message: "Socket initialized",
      socketId: socket.id,
    });

    socket.on("create-room", async ({ username, avatar }, callback) => {
      const roomCode = await createRoom(socket.id, username, avatar);
      socket.join(roomCode);
      callback({ roomCode, message: "Room created" });
      io.to(roomCode).emit("room-updated", {
        message: "Room created",
        roomCode,
      });

      // Fetch and emit game state directly to the creator socket
      const gameState = await redis.get(`gameState:${roomCode}`);
      if (gameState) {
        socket.emit("game_state_update", JSON.parse(gameState));
      } else {
        console.error(
          "Failed to fetch game state from Redis for room:",
          roomCode
        );
      }
    });

    socket.on("join-room", async ({ roomCode, username, avatar }, callback) => {
      console.log("join-room called:", roomCode, username);
      const room = await joinRoom(roomCode, socket.id, username, avatar);
      if (!room) {
        return callback({ error: "Room not found" });
      }
      socket.join(roomCode);
      callback(room);
      io.to(roomCode).emit("room-updated", room);

      // Fetch and emit game state directly to the joining socket
      const gameState = await redis.get(`gameState:${roomCode}`);
      if (gameState) {
        socket.emit("game_state_update", JSON.parse(gameState));
        console.log("Emitted game_state_update to", socket.id);
      } else {
        console.error("No game state found in Redis for", roomCode);
      }

      // Start the game immediately after a player joins
      await startGame(roomCode, io);
    });

    socket.on("start-game", async (roomCode) => {
      await startGame(roomCode, io); // Ensure startGame emits the game state
    });

    socket.on("draw", (drawingData) => {
      const { roomCode, drawing, guess } = drawingData;

      // Save the drawing data or update state in Redis if necessary
      redis.set(`drawing:${roomCode}`, JSON.stringify(drawing));

      // Emit drawing update to other players in the room
      io.to(roomCode).emit("drawing-update", { drawing });

      // If guess is correct, update scores
      if (guess === currentWord) {
        io.to(roomCode).emit("correct-guess", { username, score });
        handleRound(roomCode, io); // Ensure handleRound emits the updated game state
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
