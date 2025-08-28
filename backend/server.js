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

httpServer.listen(3000, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
