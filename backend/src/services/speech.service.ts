import fs from "fs";
import OpenAI from "openai";

// Groq cũng cung cấp Whisper API miễn phí, tương thích OpenAI SDK
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/** Chuyển audio (đường dẫn file) thành text bằng Whisper (qua Groq) */
export async function transcribeAudio(filePath: string): Promise<string> {
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3-turbo",
    language: "vi",
  });
  return transcription.text;
}
