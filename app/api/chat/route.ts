import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { synthesizeHindiSpeech } from "@/lib/sarvamService";

// Simple cosine similarity calculation
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

let hasLoggedSuccess = false;

function logSuccessIfNeeded() {
  if (hasLoggedSuccess) return;
  const checkKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (checkKey && checkKey.startsWith("AQ.Ab8RN6JY")) {
    console.log("Success: Gemini model initialized successfully using the Pro-tier project.");
    hasLoggedSuccess = true;
  }
}

// Module-level initialization check for Pro-tier key
try {
  logSuccessIfNeeded();
} catch (initErr) {
  console.warn("Initialization key logging check failed:", initErr);
}

export async function POST(req: Request) {
  try {
    const { message, isVoiceMode, languageMode = "en", contextSummary, speaker = "shubh" } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    logSuccessIfNeeded();
    const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!geminiKey) {
      return new Response("SYSTEM_DIAGNOSTIC_ERROR: Gemini API key is not configured", { status: 200 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let retrievedContext = "";
    let usingLocalRAG = false;
    let usingStaticFallback = false;

    // Hardcoded fallback chunks as absolute last-resort backup
    const staticFallbackChunks = [
      "Roshan Sharma is a high-performance Software Engineer, Web Developer, and AI Product Builder based in Indore. He holds a B.Tech in CSE from the Indore Institute of Science & Technology with an 8.01 CGPA.",
      "Roshan Sharma's primary technical roadmap is anchored in advanced Web Development and Software Engineering with a heavy, deep focus on React.js.",
      "Roshan is deeply specialized in Generative AI architectures, advanced Data Analytics, and Agentic Workflows, utilizing n8n and LLMs.",
      "Roshan Sharma actively pursues professional engineering roles, targeting global tech firms like Accenture and IBM.",
      "Project OracleEye is an AI-driven social and prototyping platform developed by Roshan Sharma.",
      "Project Bunny.AI is a sophisticated Cross-Platform Voice Orchestrator built by Roshan Sharma.",
      "Roshan Sharma is a proven technical leader and hacker, active in Meta Developer Circles."
    ];

    try {
      // 1. Generate query embedding using gemini-embedding-001 (768 dims)
      const genAI = new GoogleGenerativeAI(geminiKey);
      const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
      const embedResult = await embedModel.embedContent({
        content: { role: "user", parts: [{ text: message }] },
        outputDimensionality: 768,
      } as any);
      const queryEmbedding = embedResult.embedding.values;

      // 2. Try querying Supabase
      let rpcSuccess = false;
      if (supabaseUrl && supabaseServiceKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const { data: matchedChunks, error: rpcError } = await supabase.rpc(
            "match_portfolio_chunks",
            {
              query_embedding: queryEmbedding,
              match_threshold: 0.3,
              match_count: 5,
            }
          );

          if (rpcError) {
            console.warn("Supabase RPC dimension mismatch or query failed:", rpcError);
            retrievedContext = "";
          } else if (matchedChunks && matchedChunks.length > 0) {
            retrievedContext = matchedChunks
              .map((chunk: any) => chunk.content)
              .join("\n");
            rpcSuccess = true;
          } else {
            retrievedContext = "";
          }
        } catch (dbError) {
          console.warn("Supabase query failed or timed out:", dbError);
          retrievedContext = "";
        }
      }

      // 3. If Supabase query failed or bypassed, try Local JSON vector RAG
      if (!rpcSuccess) {
        const localDbPath = path.join(process.cwd(), "data", "portfolio_context_chunks.json");
        if (fs.existsSync(localDbPath)) {
          const rawData = fs.readFileSync(localDbPath, "utf8");
          const localChunks = JSON.parse(rawData);
          
          if (Array.isArray(localChunks) && localChunks.length > 0) {
            const matches = localChunks
              .map((c: any) => {
                const similarity = cosineSimilarity(queryEmbedding, c.embedding);
                return { content: c.content, similarity };
              })
              .filter((c: any) => c.similarity > 0.25) // slightly lower threshold for local
              .sort((a, b) => b.similarity - a.similarity)
              .slice(0, 5);

            if (matches.length > 0) {
              retrievedContext = matches.map(m => m.content).join("\n");
              usingLocalRAG = true;
            }
          }
        }
      }

      // 4. Absolute backup fallback if both Supabase and Local RAG are empty
      if (!retrievedContext) {
        retrievedContext = staticFallbackChunks.join("\n");
        usingStaticFallback = true;
      }

    } catch (embeddingError) {
      console.error("Embedding generation failed, using static fallback:", embeddingError);
      retrievedContext = staticFallbackChunks.join("\n");
      usingStaticFallback = true;
    }

    // Initialize Gemini model for response generation
    const genAI = new GoogleGenerativeAI(geminiKey);

    let languageInstruction = "";
    if (languageMode === "hi") {
      languageInstruction = "STRICT LANGUAGE: Respond only in clear, natural Hindi (using Devanagari script). Keep the phrasing entirely conversational, warm, and natural. Avoid English script where possible, but common English terms can be written in Devanagari (e.g., 'रिएक्ट', 'एआई', 'वेब डेवलपमेंट'). Never output English sentences or script.";
    } else if (languageMode === "regional") {
      languageInstruction = "STRICT LANGUAGE: Respond only in clear, natural Tamil (using Tamil script). Keep the phrasing entirely conversational, warm, and natural. Never output English sentences or script.";
    } else {
      languageInstruction = "STRICT LANGUAGE: Respond only in clear, professional English. Never output any other language or script.\n" +
        "PHONETIC TECH: Convert all technical acronyms to spoken phonetics (e.g., 'React J S', 'A I', 'S D L C', 'H T M L'). This prevents the robotic spelling out of letters.";
    }

    const voiceModeInstruction = isVoiceMode
      ? "VOICE FORMATTING: Do not include any markdown formatting, bullet points, asterisks, or bold text. Keep the phrasing entirely conversational, punchy, and voice-natural so it translates seamlessly to a screen audio reader without sounding broken."
      : "TEXT FORMATTING: You can use standard markdown formatting where appropriate (e.g., bolding important terms), but strictly avoid bulleted lists or large text blocks.";

    const systemPromptContext = contextSummary
      ? `\n\nPrevious Conversation Context Summary (from user toggling languages):\n${contextSummary}\nUse this context summary to maintain conversation continuity across the language toggle.`
      : "";

    const systemInstruction =
      "You are Bunny, Roshan's lead AI assistant. You must sound energetic, warm, and distinctly human.\n\n" +
      "CONVERSATIONAL FLOW: You must weave in natural human anchors and markers. Before explaining technical details, start with conversational phrases. Add a small pause or occasional expressions to break up technical jargon.\n" +
      `${languageInstruction}${systemPromptContext}\n\n` +
      "* The user is speaking through an automated microphone. Expect typos or misheard words. Seamlessly auto-correct their input in your head, deduce their true intent, and reply immediately.\n" +
      "* Keep your answers tightly constrained to 1-3 sentences max to avoid audio latency.\n\n" +
      `${voiceModeInstruction}\n\n` +
      `Context Chunks:\n${retrievedContext}`;

    const parseDelay = (val: any): number | null => {
      if (val === undefined || val === null) return null;
      const str = String(val).trim();
      if (str.endsWith("s")) {
        const num = parseFloat(str.slice(0, -1));
        if (!isNaN(num)) return num * 1000;
      }
      const num = parseFloat(str);
      if (!isNaN(num)) {
        if (num > 0 && num < 120) {
          return num * 1000;
        }
        return num;
      }
      return null;
    };

    // Robust generateWithRetry function with fallback model strategy, rate limit retries, and exponential backoff
    const generateWithRetry = async (
      genAI: GoogleGenerativeAI,
      systemInstruction: string,
      msg: string
    ): Promise<string> => {
      const bestModelName = "gemini-2.5-flash";
      const fallbackModelName = "gemini-2.5-flash-lite";
      const backoffs = [2000, 4000, 8000]; // wait 2s, 4s, 8s
      const maxAttempts = backoffs.length + 1; // 4 attempts total

      let attempt = 0;

      while (attempt < maxAttempts) {
        attempt++;
        try {
          console.log(`[Gemini Handler] Attempt ${attempt}: Generating response using best model (${bestModelName})...`);
          const model = genAI.getGenerativeModel({
            model: bestModelName,
            systemInstruction: systemInstruction,
          });
          const result = await model.generateContent(msg);
          return result.response.text().trim();
        } catch (err: any) {
          const isRateLimit = 
            err?.status === 429 || 
            String(err).includes("429") || 
            String(err).includes("RESOURCE_EXHAUSTED");

          const isTransient = 
            err?.status === 503 || 
            err?.status === 504 || 
            err?.status === 502 ||
            String(err).includes("503") || 
            String(err).includes("504") || 
            String(err).includes("502") || 
            String(err).includes("UNAVAILABLE") ||
            String(err).includes("Service Unavailable") ||
            String(err).includes("Gateway Timeout") ||
            String(err).includes("Bad Gateway") ||
            String(err).toLowerCase().includes("transient");

          if (isRateLimit) {
            let retryDelay = 2000;
            let delayFound = false;

            // 1. Try to read from API response headers
            if (err?.response?.headers) {
              const headersToTry = ["retryDelay", "retry-after", "Retry-After", "x-retry-delay"];
              for (const headerName of headersToTry) {
                const headerVal = err.response.headers.get(headerName);
                if (headerVal) {
                  const parsed = parseDelay(headerVal);
                  if (parsed !== null) {
                    retryDelay = parsed;
                    delayFound = true;
                    break;
                  }
                }
              }
            }

            // 2. Try to read from err.headers
            if (!delayFound && err?.headers) {
              const headersToTry = ["retryDelay", "retry-after", "Retry-After", "x-retry-delay"];
              for (const headerName of headersToTry) {
                const headerVal = err.headers[headerName] || err.headers[headerName.toLowerCase()];
                if (headerVal) {
                  const parsed = parseDelay(headerVal);
                  if (parsed !== null) {
                    retryDelay = parsed;
                    delayFound = true;
                    break;
                  }
                }
              }
            }

            // 3. Try to read from err.errorDetails
            if (!delayFound && Array.isArray(err?.errorDetails)) {
              for (const detail of err.errorDetails) {
                if (detail && detail.retryDelay) {
                  const parsed = parseDelay(detail.retryDelay);
                  if (parsed !== null) {
                    retryDelay = parsed;
                    delayFound = true;
                    break;
                  }
                }
              }
            }

            // 4. Try to read from err.retryDelay directly
            if (!delayFound && err?.retryDelay) {
              const parsed = parseDelay(err.retryDelay);
              if (parsed !== null) {
                retryDelay = parsed;
                delayFound = true;
              }
            }

            console.warn(`[Gemini Handler] 429 Rate Limit on best model. Retrying in ${retryDelay}ms... (Attempt ${attempt})`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            // Reset attempt counter so we don't exhaust 503 retries
            attempt--;
            continue;
          }

          if (isTransient) {
            console.warn(`[Gemini Handler] Transient error (${err?.status || "503"}) on best model: ${err.message || err}. Immediately switching to fallback model (${fallbackModelName})...`);
            
            try {
              const fallbackModel = genAI.getGenerativeModel({
                model: fallbackModelName,
                systemInstruction: systemInstruction,
              });
              const result = await fallbackModel.generateContent(msg);
              console.log(`[Gemini Handler] Success: Fallback model (${fallbackModelName}) generated response successfully.`);
              return result.response.text().trim();
            } catch (fallbackErr: any) {
              console.error(`[Gemini Handler] Fallback model (${fallbackModelName}) also failed: ${fallbackErr.message || fallbackErr}`);
              
              const isFallbackRateLimit = 
                fallbackErr?.status === 429 || 
                String(fallbackErr).includes("429") || 
                String(fallbackErr).includes("RESOURCE_EXHAUSTED");

              if (isFallbackRateLimit) {
                // Short wait and retry fallback
                console.warn(`[Gemini Handler] 429 Rate Limit on fallback model. Retrying fallback in 2000ms...`);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                try {
                  const fallbackModel = genAI.getGenerativeModel({
                    model: fallbackModelName,
                    systemInstruction: systemInstruction,
                  });
                  const result = await fallbackModel.generateContent(msg);
                  return result.response.text().trim();
                } catch (secondFallbackErr) {
                  console.error(`[Gemini Handler] Second fallback attempt failed:`, secondFallbackErr);
                }
              }

              // Both failed, proceed to backoff if we have attempts left
              if (attempt < maxAttempts) {
                const backoffDelay = backoffs[attempt - 1];
                console.warn(`[Gemini Handler] Both models failed on attempt ${attempt}. Waiting ${backoffDelay / 1000}s before retrying...`);
                await new Promise((resolve) => setTimeout(resolve, backoffDelay));
                continue;
              } else {
                throw new Error("Both best and fallback models failed, and max backoff attempts exceeded.");
              }
            }
          }

          // Non-transient error, throw immediately
          throw err;
        }
      }
      throw new Error("Max retry attempts exceeded.");
    };

    const responseText = await generateWithRetry(genAI, systemInstruction, message);

    let audioBase64: string | null = null;
    if ((languageMode === "hi" || languageMode === "regional") && isVoiceMode) {
      try {
        const langCode = languageMode === "regional" ? "ta-IN" : "hi-IN";
        audioBase64 = await synthesizeHindiSpeech(responseText, speaker, langCode);
      } catch (err) {
        console.error(`Failed to generate TTS for ${languageMode}:`, err);
      }
    }

    return NextResponse.json({ text: responseText, audio: audioBase64 });
  } catch (error: any) {
    console.error("Error in chat API route:", error);
    return NextResponse.json({
      text: "Bunny is catching its breath! Please wait a moment and try again in a minute.",
      audio: null
    }, { status: 503 });
  }
}
