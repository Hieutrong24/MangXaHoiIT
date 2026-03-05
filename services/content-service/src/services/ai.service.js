const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

class AIService {
  async generateSuggestion({ posts = [], tags = [] }) {
    const prompt = `
Bạn là mentor cho sinh viên Công nghệ Thông tin TDMU.

Dựa vào:
- Các bài gần đây: ${posts.map(p => p.title).join(", ")}
- Các tag phổ biến: ${tags.join(", ")}

Hãy:
1. Gợi ý 1 lộ trình học tiếp theo
2. Gợi ý 2 chủ đề nên đọc
3. Trả về tối đa 120 từ
Viết ngắn gọn, phong cách hacker cyber.
`;

    try {
      const completion = await client.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama3-70b-8192",
        messages: [
          { role: "system", content: "Bạn là mentor IT chuyên nghiệp." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return completion.choices[0].message.content;
    } catch (err) {
      console.error("🔥 Groq Error:", err.message);

      // fallback nếu lỗi
      return `
🚀 Lộ trình đề xuất:
- Học vững DSA → SQL → React
- Đọc thêm về System Design
- Làm 1 project fullstack nhỏ để củng cố kiến thức.
`;
    }
  }
}

module.exports = new AIService();