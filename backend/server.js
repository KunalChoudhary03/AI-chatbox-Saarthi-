require('dotenv').config();
const app = require('./src/app');
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateResponse = require('./src/service/ai.service');

const httpServer = createServer(app);

const io = new Server(httpServer, { 
  cors: {
    origin: [
      "https://ai-chatbox-saarthi.vercel.app",  
      "http://localhost:5173"                   
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const chatHistory = [];

io.on("connection", (socket) => {
  console.log('A user connected');
  
  socket.on("disconnect", () => {
    console.log('A user is disconnected');
  });

  socket.on('ai-message', async (data) => {
    console.log('Received Ai message:', data);

    chatHistory.push({
      role: "user",
      parts: [{ text: data }]
    });

    const response = await generateResponse(chatHistory);

    chatHistory.push({
      role: "model",
      parts: [{ text: response }],
    });

    socket.emit("ai-message-response", response);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
