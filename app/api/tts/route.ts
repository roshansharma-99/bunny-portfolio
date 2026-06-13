import { NextResponse } from "next/server";
import { sarvamService } from "@/lib/sarvamService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, speaker = "shubh", languageCode = "hi-IN", provider } = body;
    
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (provider === "elevenlabs") {
      const apiKey = process.env.ELEVENLABS_API_KEY || "sk_1bf760d9276c9e231cbb8f90481bf8259ec4129a49ba2bcc";
      const voiceId = speaker || "21m00Tcm4TlvDq8ikWAM";
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_flash_v2_5",
          voice_settings: { stability: 0.6, similarity_boost: 0.8 }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: `ElevenLabs quota spent or error: ${errText}` }, { status: response.status });
      }

      const audioBlob = await response.blob();
      return new Response(audioBlob, {
        headers: {
          "Content-Type": "audio/mpeg"
        }
      });
    }

    const base64Audio = await sarvamService.synthesize(text, speaker, languageCode);
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
    const languageCode = searchParams.get("languageCode") || "hi-IN";

    if (!text) {
      return new Response("Text parameter is required", { status: 400 });
    }

    const streamResponse = await sarvamService.streamTTS(text, speaker, languageCode);
    
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
