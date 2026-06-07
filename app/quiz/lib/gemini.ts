import { GoogleGenAI } from "@google/genai";
import { Question } from "../types";

// NOTE: In a real Next.js app, this should be a server action to hide the API key.
// Since this is a client-side demo, we assume the key is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getExplanation = async (question: Question): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Vui lòng cấu hình API_KEY để xem giải thích từ AI.";
  }

  try {
    const prompt = `
      Hãy giải thích ngắn gọn (dưới 50 từ) tại sao đáp án "${question.options[question.correctAnswerIndex]}" lại đúng cho câu hỏi: "${question.text}".
      Trả lời bằng tiếng Việt, giọng văn thú vị, phù hợp cho học sinh.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: prompt,
    });

    return response.text || "Không thể tải giải thích lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã có lỗi xảy ra khi gọi AI.";
  }
};