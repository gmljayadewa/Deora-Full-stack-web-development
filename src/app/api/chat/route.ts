import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { rateLimit } from "@/lib/rate-limit";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
  timeout: 30_000,
  maxRetries: 0,
});

export async function POST(req: Request) {
  try {
    // 1. Rate limit
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please wait a minute." },
        { status: 429 }
      );
    }

    // 2. Check the key exists
    if (!process.env.AI_API_KEY) {
      console.error("AI_API_KEY is missing");
      return NextResponse.json({ error: "Chat is not configured." }, { status: 500 });
    }

    // 3. Read and validate the body
    const body = await req.json().catch(() => null);
    const messages = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages is required" }, { status: 400 });
    }

    // 4. Clean messages: only user/assistant, text only, limited length
    const clean = messages
      .filter(
        (m: any) =>
          (m?.role === "user" || m?.role === "assistant") &&
          typeof m?.content === "string" &&
          m.content.trim().length > 0
      )
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, 500) }))
      .slice(-10);

    if (clean.length === 0 || clean[clean.length - 1].role !== "user") {
      return NextResponse.json({ error: "Last message must be from the user" }, { status: 400 });
    }

    // 5. Call the AI
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL ?? "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 1000, // limits answer length and cost
      reasoning_effort: "low",
      messages: [{ role: "system", content: buildSystemPrompt() }, ...clean],
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content ?? "Sorry, I have no answer.",
    });
  } catch (err: any) {
    console.error("Chat error:", err?.status, err?.message);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? err?.message
            : "Something went wrong. Please try again.",
      },
      { status: err?.status === 429 ? 429 : 500 }
    );
  }
}