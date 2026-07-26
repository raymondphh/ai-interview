import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "llama-3.3-70b-versatile";

/** Danh sách ngành nghề cố định để người dùng lựa chọn trong Ngân hàng câu hỏi */
export const INDUSTRIES = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Mobile Developer (iOS/Android)",
  "DevOps Engineer",
  "Data Analyst",
  "Data Engineer",
  "Data Scientist / AI-ML Engineer",
  "QA/Tester",
  "UI/UX Designer",
  "Product Manager",
  "Business Analyst",
  "Project Manager",
  "Digital Marketing",
  "Kế toán - Tài chính",
  "Nhân sự (HR)",
  "Sales - Kinh doanh",
];

export const LEVELS = [
  "Intern",
  "Fresher",
  "Junior",
  "Middle",
  "Senior",
  "Lead/Manager",
];

/** Sinh danh sách câu hỏi phỏng vấn cho 1 ngành nghề + 1 cấp bậc cụ thể */
export async function generateQuestionsForIndustryLevel(
  industry: string,
  level: string,
  count = 15,
): Promise<string[]> {
  const levelGuidance: Record<string, string> = {
    Intern:
      "kiến thức nền tảng, lý thuyết cơ bản, thái độ học hỏi, chưa yêu cầu kinh nghiệm thực chiến",
    Fresher:
      "kiến thức nền tảng vững, có thể có đồ án/dự án cá nhân, chưa nhiều kinh nghiệm đi làm thực tế",
    Junior:
      "đã áp dụng được kiến thức vào công việc thực tế 1-2 năm, xử lý task được giao dưới sự hướng dẫn",
    Middle:
      "độc lập giải quyết vấn đề phức tạp, có kinh nghiệm thiết kế giải pháp, tối ưu hiệu năng, mentor người mới",
    Senior:
      "tư duy kiến trúc hệ thống, ra quyết định kỹ thuật quan trọng, dẫn dắt dự án lớn, đánh giá trade-off",
    "Lead/Manager":
      "quản lý đội nhóm, lập kế hoạch chiến lược, phân bổ nguồn lực, kỹ năng lãnh đạo và giao tiếp cấp cao",
  };

  const prompt = `Bạn là chuyên gia tuyển dụng với nhiều năm kinh nghiệm phỏng vấn trong ngành "${industry}".

Hãy tạo ĐÚNG ${count} câu hỏi phỏng vấn CHẤT LƯỢNG CAO, phù hợp với cấp bậc "${level}" trong ngành "${industry}".

Đặc điểm cấp bậc "${level}": ${levelGuidance[level] || "phù hợp với kinh nghiệm và trách nhiệm tương ứng"}.

Yêu cầu:
- Câu hỏi phải cụ thể, thực tế, đúng trọng tâm ngành nghề "${industry}" (không chung chung, không thể áp dụng lẫn cho ngành khác).
- Độ khó và phạm vi câu hỏi phải phù hợp chính xác với cấp bậc "${level}" đã nêu.
- Kết hợp cả câu hỏi kỹ thuật/chuyên môn và câu hỏi tình huống thực tế phù hợp với cấp bậc.
- Mỗi câu hỏi độc lập, không trùng lặp ý.

Trả về DUY NHẤT một JSON object dạng {"questions": string[]}, không thêm markdown, không thêm giải thích.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content || '{"questions":[]}';
  const parsed = JSON.parse(content) as { questions: string[] };
  return parsed.questions;
}
