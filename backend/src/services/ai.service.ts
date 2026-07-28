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

export interface JDAnalysisResult {
  companyName: string;
  companyOverview: string;
  industry: string;
  companyProducts: string[];
  keyProductsRelatedToJD: string[];
  jobTitle: string;
  jobSummary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  seniorityLevel: string;
  workLocation: string;
}

/** Phân tích JD: giới thiệu công ty, sản phẩm/ngành nghề, yêu cầu tuyển dụng */
export async function analyzeJD(rawText: string): Promise<JDAnalysisResult> {
  const prompt = `Bạn là chuyên gia tuyển dụng và nghiên cứu thị trường lao động. Hãy đọc kỹ Job Description (JD) dưới đây và phân tích CHI TIẾT.

Nhiệm vụ:
1. Xác định tên công ty và viết phần GIỚI THIỆU CÔNG TY (2-4 câu) dựa trên thông tin trong JD và kiến thức công khai hợp lý về công ty đó (nếu JD không nêu rõ, suy luận từ tên công ty/ngữ cảnh JD).
2. Xác định NGÀNH NGHỀ/LĨNH VỰC kinh doanh chính của công ty.
3. Liệt kê các SẢN PHẨM/DỊCH VỤ chính của công ty (dựa trên JD và thông tin công khai hợp lý).
4. Liệt kê các SẢN PHẨM/DỊCH VỤ KEY liên quan trực tiếp đến vị trí tuyển dụng trong JD (ứng viên sẽ làm việc với sản phẩm nào).
5. Phân tích chi tiết yêu cầu tuyển dụng: vị trí, mô tả công việc, trách nhiệm, kỹ năng bắt buộc/ưu tiên, cấp bậc, địa điểm làm việc, quyền lợi.

Trả về DUY NHẤT một JSON object (không markdown, không giải thích ngoài JSON):
{
  "companyName": string,
  "companyOverview": string (giới thiệu công ty 2-4 câu),
  "industry": string (ngành nghề/lĩnh vực kinh doanh),
  "companyProducts": string[] (các sản phẩm/dịch vụ chính của công ty),
  "keyProductsRelatedToJD": string[] (sản phẩm/dự án key liên quan trực tiếp đến vị trí trong JD),
  "jobTitle": string,
  "jobSummary": string (tóm tắt vị trí 2-3 câu),
  "requiredSkills": string[],
  "preferredSkills": string[],
  "responsibilities": string[],
  "requirements": string[],
  "benefits": string[],
  "seniorityLevel": string (Intern | Fresher | Junior | Middle | Senior | Lead/Manager),
  "workLocation": string
}

JD cần phân tích:
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
  return JSON.parse(content) as JDAnalysisResult;
}

/** Sinh câu hỏi phỏng vấn bám sát CV và JD (nếu có) */
export async function generateQuestions(
  analysis: CVAnalysisResult,
  count = 5,
  jdAnalysis?: JDAnalysisResult | null,
): Promise<string[]> {
  const jdContext = jdAnalysis
    ? `
Thông tin công ty và JD ứng tuyển:
- Công ty: ${jdAnalysis.companyName}
- Giới thiệu: ${jdAnalysis.companyOverview}
- Ngành nghề công ty: ${jdAnalysis.industry}
- Sản phẩm/dịch vụ: ${jdAnalysis.companyProducts?.join(", ") || "không rõ"}
- Sản phẩm key liên quan JD: ${jdAnalysis.keyProductsRelatedToJD?.join(", ") || "không rõ"}
- Vị trí tuyển dụng: ${jdAnalysis.jobTitle}
- Mô tả vị trí: ${jdAnalysis.jobSummary}
- Kỹ năng bắt buộc: ${jdAnalysis.requiredSkills?.join(", ") || "không rõ"}
- Kỹ năng ưu tiên: ${jdAnalysis.preferredSkills?.join(", ") || "không rõ"}
- Trách nhiệm: ${jdAnalysis.responsibilities?.join("; ") || "không rõ"}
- Cấp bậc yêu cầu: ${jdAnalysis.seniorityLevel}
`
    : "";

  const targetRole = jdAnalysis?.jobTitle || analysis.suggestedRole;
  const targetIndustry = jdAnalysis?.industry || analysis.industry;

  const prompt = `Bạn là một Hiring Manager có chuyên môn sâu trong lĩnh vực "${targetIndustry}", đang phỏng vấn ứng viên cho vị trí "${targetRole}" (cấp bậc ứng viên: ${analysis.seniorityLevel}${jdAnalysis ? `, cấp bậc JD yêu cầu: ${jdAnalysis.seniorityLevel}` : ""}).

Thông tin ứng viên:
- Kỹ năng chuyên môn: ${analysis.technicalSkills?.join(", ") || "không rõ"}
- Lĩnh vực đã làm việc: ${analysis.domainKnowledge?.join(", ") || "không rõ"}
- Dự án/thành tích nổi bật: ${analysis.keyProjects?.join(" | ") || "không rõ"}
- Điểm mạnh: ${analysis.strengths?.join(", ") || "không rõ"}
- Điểm cần cải thiện: ${analysis.weaknesses?.join(", ") || "không rõ"}
- Số năm kinh nghiệm: ${analysis.yearsOfExperience}
${jdContext}

Hãy tạo ra ĐÚNG ${count} câu hỏi phỏng vấn CHẤT LƯỢNG CAO, bám sát chặt chẽ vào CV của ứng viên${jdAnalysis ? " VÀ yêu cầu JD/công ty tuyển dụng" : ""} (KHÔNG hỏi chung chung). Phân bổ như sau:
- 30% câu hỏi kỹ thuật chuyên sâu, dựa trực tiếp vào công nghệ/kỹ năng trong CV${jdAnalysis ? " và kỹ năng bắt buộc trong JD" : ""}.
- 25% câu hỏi khai thác sâu về các dự án/thành tích nổi bật trong CV.
${jdAnalysis ? "- 20% câu hỏi về sản phẩm/dự án của công ty và cách ứng viên phù hợp với vị trí (nhắc đến sản phẩm key liên quan JD).\n" : ""}- 20% câu hỏi tình huống thực tế (behavioral/case study) phù hợp với cấp bậc và lĩnh vực.
- 10% câu hỏi khai thác điểm cần cải thiện hoặc khoảng trống giữa CV và JD.

Mỗi câu hỏi phải cụ thể, có thể nhắc trực tiếp đến công nghệ/dự án/lĩnh vực/sản phẩm công ty đã nêu ở trên.

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
