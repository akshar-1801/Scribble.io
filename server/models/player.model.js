const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, required: true },
  score: { type: Number, default: 0 },
  isDrawer: { type: Boolean, default: false },
});

module.exports = mongoose.model("Player", playerSchema);
