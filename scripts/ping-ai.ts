import OpenAI from "openai";
import { buildSystemPrompt } from "../src/lib/ai/prompt";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
  timeout: 60_000,
  maxRetries: 0,
});
const model = process.env.AI_MODEL ?? "gpt-4o-mini";

async function timeIt(label: string, system: string) {
  const start = Date.now();
  try {
    const r = await openai.chat.completions.create({
      model,
      max_tokens: 200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: "What is the price of Moringa Capsules?" },
      ],
    });
    console.log(label, ((Date.now() - start) / 1000).toFixed(1) + "s", "→", r.choices[0].message.content?.slice(0, 80));
  } catch (e: any) {
    console.log(label, ((Date.now() - start) / 1000).toFixed(1) + "s", "ERROR", e?.status, e?.message?.slice(0, 120));
  }
}

async function main() {
  await timeIt("SMALL prompt:", "You are a shop assistant. Be short.");
  await timeIt("FULL prompt: ", buildSystemPrompt());
}
main();
