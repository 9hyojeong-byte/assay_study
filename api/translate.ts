import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sentences } = req.body;
  if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
    return res.status(400).json({ error: "올바른 문장 배열(sentences)을 제공해 주세요." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY가 서버에 설정되어 있지 않습니다." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Translate the following list of Korean sentences into natural, grammatical, and elegant English sentences. Also, generate a brief and beautiful English title that encapsulates the overall theme of these sentences.

Korean sentences:
${sentences.map((s: string, idx: number) => `[Sentence ${idx + 1}]: ${s}`).join("\n")}

You must output exactly matching indices and a single overall title.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
      config: {
        systemInstruction:
          "You are an expert bilingual English-Korean translator and professional writing coach. Translate Korean sentences to English with elegant and natural phrasing. Output strictly in JSON reflecting the provided schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A fitting English title for the essay.",
            },
            translations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "English translations corresponding exactly to each index of the input Korean sentences.",
            },
          },
          required: ["title", "translations"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Gemini API로부터 응답을 받지 못했습니다.");

    res.status(200).json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Translation error:", error);
    res.status(500).json({ error: error.message || "번역 도중 오류가 발생했습니다." });
  }
}
