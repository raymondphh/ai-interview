/** Lấy nội dung JD từ link Google Docs hoặc URL text thông thường */
export async function fetchTextFromUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed) throw new Error("Link JD không hợp lệ");

  let fetchUrl = trimmed;

  const googleDocMatch = trimmed.match(
    /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/,
  );
  if (googleDocMatch) {
    fetchUrl = `https://docs.google.com/document/d/${googleDocMatch[1]}/export?format=txt`;
  }

  const res = await fetch(fetchUrl, {
    headers: { "User-Agent": "AI-Interview-Platform/1.0" },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(
      "Không thể tải nội dung từ link. Hãy kiểm tra link công khai hoặc thử upload file.",
    );
  }

  const text = await res.text();
  if (!text.trim()) {
    throw new Error("Link không có nội dung JD để phân tích");
  }
  return text.trim();
}
