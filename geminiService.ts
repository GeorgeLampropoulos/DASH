import { GoogleGenAI } from "@google/genai";
import { Reservation } from '@/types';

const getAiClient = () => {
  let apiKey = '';
  
  // 1. Try process.env (Vite 'define' replacement)
  // This looks weird but in Vite, process.env.API_KEY is replaced by the actual string during build
  // if configured in vite.config.ts define options.
  try {
    if (process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }

  // 2. Try import.meta.env (Standard Vite)
  if (!apiKey) {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
        apiKey = import.meta.env.VITE_API_KEY;
      }
    } catch(e) {
      console.warn("Failed to access import.meta.env");
    }
  }

  if (!apiKey) {
    console.warn("API_KEY is not set in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateShiftBriefing = async (reservations: Reservation[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing. Unable to generate briefing.";

  const today = new Date().toISOString().split('T')[0];
  const todaysReservations = reservations.filter(r => r.date === today);

  const prompt = `
    You are an expert Restaurant Manager Assistant. 
    Analyze the following list of reservations for today (${today}) and provide a "Pre-Shift Briefing" for the owner.
    
    Data:
    ${JSON.stringify(todaysReservations, null, 2)}
    
    Structure your response in Markdown with these sections:
    1. **Summary**: Total covers, peak time, and general vibe.
    2. **Critical Alerts**: Large groups (6+), dietary restrictions, or VIPs.
    3. **Kitchen Prep**: Specific dishes to prep based on requests or general volume.
    4. **Staffing Advice**: Where to allocate servers (e.g., "Need strong server for Table 12").
    5. **Action Items**: 3 bullet points of what the owner needs to do right now.

    Tone: Professional, concise, and actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No briefing generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate shift briefing. Please check your connection or API key.";
  }
};

export const chatWithManagerAssistant = async (message: string, context: Reservation[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Error: API Key missing.";

    const systemInstruction = `
      You are RestoBot, a helpful AI assistant for a restaurant owner.
      You have access to the current reservations list.
      Answer questions about the schedule, guests, or general restaurant management.
      Be concise and helpful.
    `;
    
    const contextStr = `Current Reservations Context: ${JSON.stringify(context.slice(0, 20))}`; // Limit context size

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemInstruction}\n\n${contextStr}\n\nUser: ${message}`,
        });
        return response.text || "I'm not sure how to answer that.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Sorry, I'm having trouble connecting to the brain.";
    }
}