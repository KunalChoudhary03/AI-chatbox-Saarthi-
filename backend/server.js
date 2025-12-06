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
    console.log("[socket] User message from", socket.id, ":", data);

    try {
      // Push user message
      userChats[socket.id].push({
        role: "user",
        parts: [{ text: data }]
      });

      // Generate AI reply - pass only the latest user text (matches Postman test input)
      const latestUserEntry = data; // `data` is the raw message string from the client
      const botReply = await generateResponse(latestUserEntry);

      // Push bot message into user history
      userChats[socket.id].push({
        role: "model",
        parts: [{ text: botReply }]
      });

      // Log the bot reply before sending
      try {
        const replyForLog = (typeof botReply === 'string') ? botReply : JSON.stringify(botReply);
        console.log(`[socket] Sending bot reply to ${socket.id}:`, replyForLog);
      } catch (logErr) {
        console.error('[socket] Failed to stringify botReply for log', logErr);
      }

      // Send bot message back to user
      socket.emit("ai-message-response", botReply);
    } catch (err) {
      console.error("AI Error:", err && err.stack ? err.stack : err);

      socket.emit(
        "ai-message-response",
        "Sorry, I am facing issues processing your request."
      );
    }
  });
});

const PORT = process.env.PORT || 3000;

// Log configured CORS origins for easier debugging in production
try {
  const corsOrigins = (io && io.opts && io.opts.cors && io.opts.cors.origin) || [];
  console.log('Configured socket CORS origins:', corsOrigins);
} catch (e) {
  // ignore
}

httpServer.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
