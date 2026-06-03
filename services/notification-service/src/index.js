require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { startWorker } = require('./worker');

const app = express();
app.use(cors({
  origin: ["https://bid-rush.netlify.app", "http://localhost:5173"],
  credentials: true
}))
app.use(express.json());

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Notification Service is running' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.io] User connected: ${socket.id}`);

  // When user opens an auction page, they join a room named auction_{id}
  socket.on('join_auction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined room: auction_${auctionId}`);
  });

  // When user leaves an auction page
  socket.on('leave_auction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`[Socket.io] Socket ${socket.id} left room: auction_${auctionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] User disconnected: ${socket.id}`);
  });
});

// Start the BullMQ worker and pass io so it can emit events
startWorker(io);

const PORT = process.env.PORT || 5004;
server.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
