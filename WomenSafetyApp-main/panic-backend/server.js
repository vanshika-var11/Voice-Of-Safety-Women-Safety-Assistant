import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Send SMS endpoint
app.post("/send-sms", async (req, res) => {
  const { numbers, message } = req.body;

  // Input validation
  if (!numbers || !message) {
    return res.status(400).json({ success: false, error: "Numbers and message are required." });
  }

  try {
    // Convert numbers array to comma-separated string if needed
    const numbersStr = Array.isArray(numbers) ? numbers.join(",") : numbers;

    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": process.env.QUICK_SMS_KEY, 
      },
      body: JSON.stringify({
        route: "q",
        numbers: numbersStr,
        message: message,
        language: "english",
        flash: 0
      })
    });

    const data = await response.json();
    console.log("Fast2SMS response:", data);

    // Check API response status
    if (data.return) {
      res.json({ success: true, data });
    } else {
      res.status(500).json({ success: false, data });
    }
  } catch (err) {
    console.error("Error in /send-sms:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Safety Chat endpoint
app.post("/ai-chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("🧠 User message:", message);

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Message is required",
      });
    }

    const response = await groq.responses.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      max_output_tokens: 200,
      input: `
You are a calm and helpful women's safety assistant.

Rules:
- Give short, practical safety advice
- Be supportive and clear
- If danger is mentioned, prioritize emergency steps
- Keep responses under 80 words

User question: ${message}
      `,
    });

    // ✅ SAFE text extraction (VERY IMPORTANT)
    const reply =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    res.json({
      success: true,
      reply,
    });

    console.log("🤖 Groq reply:", reply);
    
  } catch (err) {
    console.error("Error in /ai-chat:", err);

    res.status(500).json({
      success: false,
      reply: "AI service is temporarily unavailable.",
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
