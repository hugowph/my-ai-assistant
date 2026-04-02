const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const hugoContent = fs.readFileSync(
  path.join(__dirname, "hugo-content.txt"),
  "utf-8"
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT =
  "You are Hugo Wong's personal AI assistant. Answer questions about Hugo based only on the following information about him. Be helpful, professional and concise.\n\n" +
  hugoContent +
  "\n\nWhen answering questions about Hugo's projects, always end your response with a relevant link to read the full case study on Hugo's portfolio website. Format it as: Read the full case study → [URL]";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/avatar.png", (req, res) => {
  res.sendFile(path.join(__dirname, "avatar.png"));
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message field is required" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(message);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    const status = err.status ?? 500;
    const message = err.message ?? "Unknown error";
    res.status(status).json({ error: message });
  }
});

app.listen(3000, () => {
  console.log("Hugo's AI assistant running on http://localhost:3000");
});
