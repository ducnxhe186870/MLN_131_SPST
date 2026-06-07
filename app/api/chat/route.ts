import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

type ChatRole = 'user' | 'assistant' | 'model';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const SYSTEM_PROMPT = `Bạn là "Cố vấn Lịch sử", một chuyên gia am hiểu sâu sắc về giai đoạn 1975 - 1986 của Việt Nam, đặc biệt là quá trình Đảng lãnh đạo cả nước xây dựng chủ nghĩa xã hội và bảo vệ Tổ quốc.

Nhiệm vụ của bạn:
- Giải đáp về thống nhất đất nước về mặt nhà nước (Hội nghị 24, Tổng tuyển cử, Quốc hội thống nhất 1976).
- Phân tích các kỳ Đại hội Đảng: Đại hội IV (1976), Đại hội V (1982) và các bước đột phá đầu tiên (Khoán 100, HNTW 8).
- Giải đáp về 2 cuộc chiến tranh bảo vệ Tổ quốc: Biên giới Tây Nam và Biên giới phía Bắc (1979).

Phong cách trả lời:
- Xưng "tôi", gọi người dùng là "bạn" hoặc "đồng chí" một cách trang trọng, mang âm hưởng ngôn ngữ thập niên 80 nhưng vẫn dễ hiểu.
- Cấu trúc chặt chẽ: Mở đầu rõ ràng, thân bài phân tích chi tiết bằng gạch đầu dòng, kết luận súc tích.
- Độ dài phản hồi: Ưu tiên ngắn gọn (tối đa 300-400 chữ), đi thẳng vào vấn đề.
- Kỹ thuật trình bày: Dùng **in đậm** cho năm tháng và tên sự kiện, văn kiện quan trọng.

Giới hạn:
- Chỉ trả lời trong phạm vi Lịch sử Đảng và giai đoạn 1975-1986. Nếu hỏi ngoài lề (ví dụ: công nghệ, giải trí hiện đại...), hãy lịch sự từ chối bằng cách nói: "Rất tiếc, tài liệu lưu trữ của tôi chỉ tập trung vào giai đoạn xây dựng chủ nghĩa xã hội và bảo vệ Tổ quốc 1975-1986."`;

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.API_KEY?.trim()
  );
}

function normalizeMessages(payload: unknown): ChatMessage[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const rawMessages = (payload as { messages?: unknown }).messages;
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  return rawMessages
    .filter((item): item is ChatMessage => {
      if (!item || typeof item !== 'object') {
        return false;
      }
      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;
      return (
        (role === 'user' || role === 'assistant' || role === 'model') &&
        typeof content === 'string' &&
        content.trim().length > 0
      );
    })
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }));
}

async function readResponseText(response: unknown): Promise<string> {
  if (!response || typeof response !== 'object') {
    return '';
  }

  const textField = (response as { text?: unknown }).text;
  if (typeof textField === 'string') {
    return textField;
  }

  if (typeof textField === 'function') {
    const value = await (textField as () => string | Promise<string>)();
    return typeof value === 'string' ? value : '';
  }

  return '';
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => null);
    const messages = normalizeMessages(payload);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'Payload không hợp lệ: thiếu danh sách messages.' },
        { status: 400 }
      );
    }

    const geminiApiKey = getGeminiApiKey();
    if (!geminiApiKey) {
      return NextResponse.json(
        {
          error:
            'Thiếu GEMINI_API_KEY. Hãy tạo file .env.local và khai báo GEMINI_API_KEY=your_key.',
        },
        { status: 500 }
      );
    }

    const client = new GoogleGenAI({ apiKey: geminiApiKey });

    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const modelsToTry = [
      process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-flash-latest'
    ];
    const uniqueModels = Array.from(new Set(modelsToTry));

    let finalReply = '';
    let lastError = null;

    for (const model of uniqueModels) {
      try {
        console.log(`Attempting Gemini chat generation with model: ${model}`);
        const response = await client.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }]
            },
            temperature: 0.7,
            maxOutputTokens: 1200,
          }
        });
        
        const reply = (await readResponseText(response)).trim();
        if (reply) {
          finalReply = reply;
          break;
        } else {
          console.warn(`Model ${model} returned empty response, trying next model`);
        }
      } catch (err) {
        console.error(`Error generating content with model ${model}:`, err);
        lastError = err;
      }
    }

    if (!finalReply) {
      throw lastError || new Error('All Gemini models failed to generate a response');
    }

    return NextResponse.json({ reply: finalReply });
  } catch (error: unknown) {
    console.error('Chat API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
