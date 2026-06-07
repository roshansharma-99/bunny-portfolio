import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format transcript
    const transcript = messages
      .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    const prompt = `You are an assistant. Summarize this conversation context for a follow-up session. Keep the summary concise, outlining the key user queries, context discussed, and current status.\n\nConversation:\n${transcript}`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error in summarize-context API:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
