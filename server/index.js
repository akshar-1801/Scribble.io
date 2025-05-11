const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
});


const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

require('./socket')(io);

app.get("/", (req, res) => {
  res.send("Skribbl clone backend is running.");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
