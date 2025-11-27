const axios = require("axios");

const chatWithAI = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Your message is invalid." });
    }

    // ✅ توليد sessionId جديد عند الحاجة
    const session =
      sessionId ||
      `chat_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const N8N_WEBHOOK_URL = process.env.N8N_CHAT_WEBHOOK_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;

    // 📦 بناء الطلب المرسل إلى n8n
    const payload = {
      chatInput: message,
      sessionId: session,
    };

    // 🚀 إرسال الطلب إلى n8n مع الرأس الأمني
    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: {
        "x-api-key": N8N_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
    });

    // 🧠 تحليل الرد القادم من n8n
    let reply = response.data.output;

    // ✅ إعادة الرد والـ sessionId للواجهة
    return res.status(200).json({ reply, sessionId: session });
  } catch (err) {
    console.error("❌ AI Chat Error:", err.message);

    // خطأ من n8n نفسه
    if (err.response) {
      return res.status(err.response.status || 500).json({
        error:
          err.response.data?.error ||
          err.response.data?.message ||
          "An error occurred while connecting to the AI service.",
      });
    }

    return res
      .status(500)
      .json({ error: "An error occured while responding to your message" });
  }
};

module.exports = {
  chatWithAI,
};
