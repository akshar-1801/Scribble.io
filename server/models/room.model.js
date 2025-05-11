const mongoose = require('mongoose');
const playerSchema = require('./player.model').schema;

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  players: [playerSchema],
  currentWord: { type: String, default: null },
  round: { type: Number, default: 1 },
  maxRounds: { type: Number, default: 5 },
  isGameActive: { type: Boolean, default: false },
  turnIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
