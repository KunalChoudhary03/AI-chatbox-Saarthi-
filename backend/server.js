require('dotenv').config();
const app = require('./src/app');
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateResponse = require('./src/service/ai.service');

const httpServer = createServer(app);
 
// Store chat history separately for each user
const userChats = {};

const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://ai-chatbox-saarthi.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(" User connected:", socket.id);

  // Initialize empty chat for this user
  userChats[socket.id] = [];

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
    delete userChats[socket.id]; // Clean memory
  });

  socket.on("ai-message", async (data) => {
    console.log(" User message:", data);

    try {
      // Push user message
      userChats[socket.id].push({
        role: "user",
        parts: [{ text: data }]
      });

      // Generate AI reply
      const botReply = await generateResponse(userChats[socket.id]);

      // Push bot message into user history
      userChats[socket.id].push({
        role: "model",
        parts: [{ text: botReply }]
      });

      // Send bot message back to user
      socket.emit("ai-message-response", botReply);
    } catch (err) {
      console.error("AI Error:", err);

      socket.emit(
        "ai-message-response",
        "Sorry, I am facing issues processing your request."
      );
    }
  });
});

httpServer.listen(3000, () => {
  console.log(" Server running on port 3000");
});
