import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY가 환경 변수에 설정되어 있지 않습니다. AI Studio의 Settings > Secrets에서 API 키를 입력해 주세요.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// 에세이 문장 번역 및 제목 생성 API
app.post("/api/translate", async (req, res) => {
  try {
    const { sentences } = req.body;
    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
       res.status(400).json({ error: "올바른 문장 배열(sentences)을 제공해 주세요." });
       return;
    }

    const ai = getAI();
    
    const prompt = `Translate the following list of Korean sentences into natural, grammatical, and elegant English sentences. Also, generate a brief and beautiful English title that encapsulates the overall theme of these sentences.
    
Korean sentences:
${sentences.map((s, idx) => `[Sentence ${idx + 1}]: ${s}`).join("\n")}

You must output exactly matching indices and a single overall title.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert bilingual English-Korean translator and professional writing coach. Translate Korean sentences to English with elegant and natural phrasing. Output strictly in JSON reflecting the provided schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A fitting English title for the essay."
            },
            translations: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "English translations corresponding exactly to each index of the input Korean sentences. Must have the same length as the input sentences array."
            }
          },
          required: ["title", "translations"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Gemini API로부터 응답을 받지 못했습니다.");
    }

    const result = JSON.parse(resultText.trim());
    res.json(result);
  } catch (error: any) {
    console.error("Translation error:", error);
    res.status(500).json({ error: error.message || "번역 및 제목 작성 도중 오류가 발생했습니다." });
  }
});

// Vite 및 정적 에셋 서빙 설정
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
});
