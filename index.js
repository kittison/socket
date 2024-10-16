const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const router = express.Router();
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router.get('/', (req, res) => {
  res.json(req.body)
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
        origin: "http://192.168.21.14:3300",
        methods: ["GET", "POST"],
        credentials: true
    },
});

io.use(function (socket, next){
  // console.log(`User ${socket.id} ${socket.handshake.auth}`);
  if (socket.handshake.auth.token==process.env.SOCKET_KEY) {
      next();
  }
  else {
      next(new Error("invalid session"));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a custom event from the client
  socket.on('message', (data) => {
    console.log('Message received:', data);

    // Emit a message back to the client
    socket.emit('response', { message: 'Message received on server!' });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on("task_updated", (data) => {
    console.log("data",data)
    try {
      io.emit("task_"+data["data"]["task"], data);
    } catch (error) {
      console.log(error.message);
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = server;