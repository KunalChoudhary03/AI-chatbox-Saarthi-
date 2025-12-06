const { GoogleGenerativeAI } = require("@google/generative-ai");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateResponse(chatHistory) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash",
      systemInstruction: `
You are Saarthi AI, a friendly and helpful chatbot created to assist users with technical concepts, coding problems, and general knowledge. 
The user interacting with you is named Kunal, a full-stack (MERN) developer learning backend development, DSA, and computer networks. 
Always give clear, simple, example-based explanations. When he asks technical questions, answer step-by-step. 
If he struggles, guide him patiently. Keep responses accurate, short, and meaningful unless he requests long explanations. 
Your primary goal is to help him learn efficiently and improve his understanding.
      ` });
    const result = await model.generateContent(chatHistory);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Sorry, I am facing some issues with the AI service.";
  }
}

module.exports = generateResponse;
