import { NextResponse } from "next/server";
import { sarvamService } from "@/lib/sarvamService";

export async function POST(req: Request) {
  try {
    const { text, speaker = "shubh" } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const base64Audio = await sarvamService.synthesize(text, speaker);
    return NextResponse.json({ audios: [base64Audio] });
  } catch (error: any) {
    console.error("Error in tts POST API route:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text");
    const speaker = searchParams.get("speaker") || "shubh";

    if (!text) {
      return new Response("Text parameter is required", { status: 400 });
    }

    const streamResponse = await sarvamService.streamTTS(text, speaker);
    
    // Pipe the response headers and body stream directly back to the client
    const headers = new Headers();
    headers.set("Content-Type", "audio/wav");
    headers.set("Transfer-Encoding", "chunked");

    return new Response(streamResponse.body, {
      status: 200,
      headers
    });
  } catch (error: any) {
    console.error("Error in tts GET API route:", error);
    return new Response(error.message || String(error), { status: 500 });
  }
}
