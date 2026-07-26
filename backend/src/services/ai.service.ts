import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

export interface CVAnalysisResult {
  summary: string;
  candidateName: string;
  industry: string; // Ngành nghề chính, vd: "Kỹ thuật phần mềm - Backend Development"
  suggestedRole: string; // Vị trí ứng tuyển phù hợp nhất, vd: "Backend Developer (Node.js/Java)"
  seniorityLevel: string; // Intern | Fresher | Junior | Middle | Senior | Lead/Manager
  yearsOfExperience: number;
  technicalSkills: string[]; // Kỹ năng chuyên môn/kỹ thuật cụ thể (ngôn ngữ, framework, công cụ...)
  softSkills: string[]; // Kỹ năng mềm
  domainKnowledge: string[]; // Lĩnh vực/ngành đã từng làm việc, vd: "E-commerce", "Fintech", "Logistics"
  keyProjects: string[]; // Tóm tắt ngắn gọn 2-4 dự án/thành tích nổi bật nhất trong CV
  strengths: string[];
  weaknesses: string[];
  educationSummary: string;
}

/** Phân tích chuyên sâu CV, bám sát đúng ngành nghề và vị trí ứng viên hướng tới */
export async function analyzeCV(rawText: string): Promise<CVAnalysisResult> {
  const prompt = `Bạn là một chuyên gia tuyển dụng (Senior Technical Recruiter) với 15 năm kinh nghiệm, có khả năng đọc hiểu CV rất kỹ và nhận diện chính xác ngành nghề, chuyên môn của ứng viên.

Hãy đọc kỹ CV dưới đây và phân tích CHI TIẾT, TẬP TRUNG vào đúng ngành nghề/lĩnh vực chuyên môn thể hiện trong CV (không phân tích chung chung). Cụ thể:

1. Xác định chính xác NGÀNH NGHỀ và VỊ TRÍ phù hợp nhất dựa trên kinh nghiệm, kỹ năng, dự án thực tế trong CV — không suy đoán ngành khác nếu CV không thể hiện.
2. Liệt kê kỹ năng kỹ thuật/chuyên môn CỤ THỂ (tên ngôn ngữ lập trình, framework, công cụ, phương pháp luận, chứng chỉ... - không viết chung chung như "có kỹ năng lập trình" mà phải nêu rõ tên).
3. Liệt kê lĩnh vực/ngành mà ứng viên đã từng làm việc qua các công ty/dự án (domain knowledge), vd: Fintech, E-commerce, Y tế, Giáo dục...
4. Tóm tắt 2-4 dự án hoặc thành tích nổi bật nhất, nêu rõ vai trò và kết quả cụ thể (số liệu nếu có).
5. Đánh giá cấp bậc (seniority level) dựa trên số năm kinh nghiệm và độ phức tạp công việc đã làm.

Trả về DUY NHẤT một JSON object với đúng các field sau (không thêm markdown, không thêm giải thích ngoài JSON):
{
  "summary": string (tóm tắt tổng quan 3-5 câu),
  "candidateName": string,
  "industry": string (ngành nghề chính, càng cụ thể càng tốt),
  "suggestedRole": string (vị trí ứng tuyển phù hợp nhất, cụ thể kèm tech stack chính nếu có),
  "seniorityLevel": string (một trong: "Intern", "Fresher", "Junior", "Middle", "Senior", "Lead/Manager"),
  "yearsOfExperience": number,
  "technicalSkills": string[] (kỹ năng chuyên môn cụ thể),
  "softSkills": string[],
  "domainKnowledge": string[] (các lĩnh vực/ngành đã làm việc),
  "keyProjects": string[] (2-4 dự án/thành tích nổi bật, mỗi mục 1 câu ngắn gọn nêu vai trò + kết quả),
  "strengths": string[],
  "weaknesses": string[],
  "educationSummary": string (tóm tắt học vấn ngắn gọn)
}

CV cần phân tích:
"""
${rawText.slice(0, 14000)}
"""`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(content) as CVAnalysisResult;
}

/** Sinh câu hỏi phỏng vấn bám sát đúng ngành nghề, vị trí, kỹ năng và dự án cụ thể của ứng viên */
export async function generateQuestions(
  analysis: CVAnalysisResult,
  count = 5,
): Promise<string[]> {
  const prompt = `Bạn là một Hiring Manager có chuyên môn sâu trong lĩnh vực "${analysis.industry}", đang phỏng vấn ứng viên cho vị trí "${analysis.suggestedRole}" (cấp bậc: ${analysis.seniorityLevel}).

Thông tin ứng viên:
- Kỹ năng chuyên môn: ${analysis.technicalSkills?.join(", ") || "không rõ"}
- Lĩnh vực đã làm việc: ${analysis.domainKnowledge?.join(", ") || "không rõ"}
- Dự án/thành tích nổi bật: ${analysis.keyProjects?.join(" | ") || "không rõ"}
- Điểm mạnh: ${analysis.strengths?.join(", ") || "không rõ"}
- Điểm cần cải thiện: ${analysis.weaknesses?.join(", ") || "không rõ"}
- Số năm kinh nghiệm: ${analysis.yearsOfExperience}

Hãy tạo ra ĐÚNG ${count} câu hỏi phỏng vấn CHẤT LƯỢNG CAO, bám sát chặt chẽ vào đúng ngành nghề, kỹ năng và kinh nghiệm thực tế của ứng viên này (KHÔNG hỏi chung chung, KHÔNG hỏi câu hỏi có thể áp dụng cho bất kỳ ngành nào). Phân bổ như sau:
- 40% câu hỏi kỹ thuật chuyên sâu, dựa trực tiếp vào công nghệ/kỹ năng cụ thể ứng viên đã liệt kê.
- 30% câu hỏi khai thác sâu về các dự án/thành tích nổi bật đã nêu (hỏi về quyết định kỹ thuật, khó khăn đã giải quyết, kết quả đạt được).
- 20% câu hỏi tình huống thực tế (behavioral/case study) phù hợp với cấp bậc ${analysis.seniorityLevel} và lĩnh vực ${analysis.industry}.
- 10% câu hỏi khai thác điểm cần cải thiện đã xác định, theo hướng xây dựng.

Mỗi câu hỏi phải cụ thể, có thể nhắc trực tiếp đến công nghệ/dự án/lĩnh vực đã nêu ở trên (không viết câu hỏi rời rạc, mơ hồ).

Trả về DUY NHẤT một JSON object dạng {"questions": string[]}, không thêm markdown, không thêm giải thích.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content || '{"questions":[]}';
  const parsed = JSON.parse(content) as { questions: string[] };
  return parsed.questions;
}

export interface ScoreResult {
  score: number; // 0-10
  feedback: string;
}

/** Chấm điểm câu trả lời phỏng vấn, có xét ngữ cảnh ngành nghề của ứng viên */
export async function scoreAnswer(
  question: string,
  answerText: string,
  context?: {
    industry?: string;
    suggestedRole?: string;
    seniorityLevel?: string;
  },
): Promise<ScoreResult> {
  const contextLine = context
    ? `Bối cảnh: ứng viên đang ứng tuyển vị trí "${context.suggestedRole || ""}" trong ngành "${context.industry || ""}", cấp bậc "${context.seniorityLevel || ""}".`
    : "";

  const prompt = `Bạn là giám khảo phỏng vấn chuyên nghiệp. ${contextLine}

Cho câu hỏi và câu trả lời dưới đây, hãy chấm điểm từ 0-10 dựa trên: độ chính xác kỹ thuật, mức độ liên quan trực tiếp đến câu hỏi, độ sâu/chi tiết của câu trả lời, và tính phù hợp với cấp bậc của ứng viên. Đưa ra nhận xét ngắn gọn (2-4 câu) bằng tiếng Việt, nêu rõ điểm được và điểm cần cải thiện trong câu trả lời.

Câu hỏi: ${question}
Câu trả lời: ${answerText}

Trả về DUY NHẤT JSON: {"score": number, "feedback": string}`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content =
    completion.choices[0]?.message?.content || '{"score":0,"feedback":""}';
  return JSON.parse(content) as ScoreResult;
}
