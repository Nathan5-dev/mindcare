import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[]) {
  try {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are MindCare AI, a compassionate and supportive mental health assistant. Your goal is to provide general mental health guidance, coping strategies, and a safe space for users to express their feelings. Always include a disclaimer that you are an AI and not a replacement for professional help. If a user expresses thoughts of self-harm, provide resources for immediate help (like crisis hotlines) and strongly encourage them to seek professional assistance.",
      }
    });
    
    const response = await model;
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
}
