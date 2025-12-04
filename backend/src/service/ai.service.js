const { GoogleGenerativeAI } = require("@google/generative-ai");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateResponse(chatHistory) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: chatHistory,
    });

    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Sorry, I am facing some issues with the AI service.";
  }
}

module.exports = generateResponse;
