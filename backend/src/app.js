// ...existing code...
const express  = require("express");

const  app = express();

app.get("/",(req,res)=>{
    res.send('Hello world')
})

// ...existing code...
// Add JSON parsing and test endpoint
app.use(express.json());
const aiService = require('./service/ai.service');
// support both module.exports = { generateResponse } and module.exports = generateResponse
const generateResponse = (typeof aiService === 'function') ? aiService : aiService.generateResponse;

app.post('/api/test-ai', async (req, res) => {
  try {
    const { messages, message } = req.body;
    const chatHistory = messages || message || 'Hello';
    const aiResponse = await generateResponse(chatHistory);
    res.json({ success: true, response: aiResponse });
  } catch (err) {
    console.error('AI test error:', err);
    res.status(500).json({ success: false, error: err.message || 'internal error' });
  }
});

module.exports = app
// ...existing code...
