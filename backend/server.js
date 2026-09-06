const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load env vars BEFORE anything else
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log('http://localhost:5000');
});

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    console.log(`Socket ${socket.id} joined document room: ${documentId}`);
  });

  socket.on('send-changes', (data) => {
    // Broadcast changes to everyone else in the document room
    socket.to(data.documentId).emit('receive-changes', data);
  });
  
  socket.on('send-title-change', (data) => {
    socket.to(data.documentId).emit('receive-title-change', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
