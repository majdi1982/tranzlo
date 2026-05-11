import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateTranslationSuggestions(text: string, sourceLang: string, targetLang: string) {
  const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Provide 3 variations with different tones (Formal, Casual, Professional): "${text}"`;
  
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
