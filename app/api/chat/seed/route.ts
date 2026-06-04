import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Simple cosine similarity calculation for local verification
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

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Initialize Gemini API client
    const genAI = new GoogleGenerativeAI(geminiKey);
    const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    // Roshan's core background parameters (7 Chunks requested by user)
    const backgroundChunks = [
      "Roshan Sharma is a high-performance Software Engineer, Web Developer, and AI Product Builder based in Indore. He holds a B.Tech in Computer Science Engineering from the Indore Institute of Science & Technology with an impressive 8.01 CGPA. Roshan bridges the gap between traditional full-stack engineering and cutting-edge autonomous AI orchestration, specializing in combining traditional software engineering lifecycles (SDLC) with modern AI-driven development paradigms (Vibe Coding) to rapidly deploy digital ecosystems. Contact Info: Email: roshan@gmail.com | Phone: 7999784718 | Github: github.com | Twitter: twitter.com | LinkedIn: linkedin.com",
      "Roshan Sharma's primary technical roadmap is anchored in advanced Web Development and Software Engineering with a heavy, deep focus on React.js. His core engineering stack includes JavaScript (ES6+), HTML5, CSS3, and Next.js. For backend infrastructure and real-time database management, Roshan expertly utilizes Supabase and Firebase, backed by solid foundational knowledge in SQL. His deployment pipeline and version control workflows rely natively on Git, GitHub, Vercel, and Netlify.",
      "Roshan is deeply specialized in Generative AI architectures, advanced Data Analytics, and Agentic Workflows. He has pursued a dedicated, advanced roadmap in Data Analytics and Generative AI through Coding Ninjas to master deep learning abstractions. Roshan's AI orchestration capabilities include integrating leading LLM APIs (OpenAI, Anthropic, Gemini), configuring robust RAG (Retrieval-Augmented Generation) pipelines, and setting up MCP-based (Model Context Protocol) tool integrations. He utilizes Cursor and Claude for high-velocity Vibe Coding prototyping and constructs complex low-code automation infrastructure using tools like n8n, Zapier, and Make.",
      "Roshan Sharma actively pursues professional engineering roles, maintaining strict alignment with enterprise software methodologies. He actively tracks and targets core full-stack application development opportunities at elite global tech firms like Accenture and IBM. He is an expert in SDLC and Agile frameworks, experienced in managing cross-functional communication pipelines between design groups and core development teams to optimize production delivery sprints.",
      "Project OracleEye is an AI-driven social and prototyping platform developed by Roshan Sharma. He built the system using React.js, Supabase, and Google Stitch, hosting the production deployment securely on Vercel. Roshan leveraged Antigravity (his Agentic IDE) alongside Google Stitch for high-velocity 'vibe design' UI/UX and rapid prototyping. The system features secure Google Authentication workflows and robust real-time database management layers powered completely by Supabase.",
      "Project Bunny.AI is a sophisticated Cross-Platform Voice Orchestrator built by Roshan Sharma. He engineered a custom desktop automation infrastructure enabling remote hardware system control via mobile devices using secure ngrok tunnels. The technical architecture integrates Ollama for localized LLM inference and a custom voice-mimicry model (OMNX) trained using Google Colab. The system implements a flawless hands-free execution layer that transcribes, processes, and maps spoken voice commands directly to local desktop environment actions.",
      "Roshan Sharma is a proven technical leader and collaborator. He served as Team Lead and secured the 2nd Prize (Runner-up) in a high-profile College Level Hackathon, orchestrating a 4-member engineering team to construct a high-performance interactive application utilizing Three.js for 3D graphics and React.js for layout architecture. Additionally, Roshan is an active member of the Meta and Facebook Developer Circles, regularly contributing to developer community forums regarding AI systems integration, multi-agent frameworks, and modern full-stack web architectures."
    ];

    const localChunksToSave: any[] = [];
    const supabaseSeeded: any[] = [];
    let supabaseErrorOccurred = false;
    let supabaseErrorMessage = "";

    // Initialize Supabase Client if credentials are configured
    let supabase: any = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    for (let i = 0; i < backgroundChunks.length; i++) {
      const chunk = backgroundChunks[i];
      
      // 1. Generate standard Gemini embedding (768 dimensions)
      const embedResult = await embedModel.embedContent({
        content: { role: "user", parts: [{ text: chunk }] },
        outputDimensionality: 768,
      } as any);
      const embeddingVector = embedResult.embedding.values;

      const chunkId = `chunk-uuid-${i + 1}`;

      // Add to local database structure to save to disk
      localChunksToSave.push({
        id: chunkId,
        content: chunk,
        embedding: embeddingVector
      });

      // 2. Try inserting into Supabase
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("portfolio_context_chunks")
            .insert({
              content: chunk,
              embedding: embeddingVector,
            })
            .select();

          if (error) {
            supabaseErrorOccurred = true;
            supabaseErrorMessage = error.message;
          } else if (data && data.length > 0) {
            supabaseSeeded.push(data[0]);
          }
        } catch (err: any) {
          supabaseErrorOccurred = true;
          supabaseErrorMessage = err.message;
        }
      }
    }

    // Save to local disk fallback JSON file
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "portfolio_context_chunks.json");
    fs.writeFileSync(filePath, JSON.stringify(localChunksToSave, null, 2), "utf8");

    // Perform a sample verification similarity query
    const testQuery = "React and Next.js full-stack software development focus Indore CSE degree";
    const testEmbedResult = await embedModel.embedContent({
      content: { role: "user", parts: [{ text: testQuery }] },
      outputDimensionality: 768,
    } as any);
    const testQueryEmbedding = testEmbedResult.embedding.values;

    let verificationResults: any[] = [];
    let verificationSource = "";

    // 1. Try querying via Supabase RPC
    if (supabase && !supabaseErrorOccurred) {
      try {
        const { data: matched, error: queryError } = await supabase.rpc(
          "match_portfolio_chunks",
          {
            query_embedding: testQueryEmbedding,
            match_threshold: 0.3,
            match_count: 2,
          }
        );
        if (!queryError && matched && matched.length > 0) {
          verificationResults = matched;
          verificationSource = "Supabase Database (RPC similarity search)";
        }
      } catch (err) {
        console.warn("Supabase verification RPC query failed, falling back to local:", err);
      }
    }

    // 2. Fall back to local in-memory cosine similarity search
    if (verificationResults.length === 0) {
      verificationSource = "Local In-Memory Vector Search (Cosine Similarity)";
      verificationResults = localChunksToSave
        .map((c) => {
          const similarity = cosineSimilarity(testQueryEmbedding, c.embedding);
          return { content: c.content, similarity };
        })
        .filter((c) => c.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 2);
    }

    return NextResponse.json({
      success: true,
      message: "RAG Database seeded and verified successfully.",
      localFileWritten: true,
      localFilePath: filePath,
      supabaseStatus: supabase
        ? supabaseErrorOccurred
          ? `Supabase write failed: ${supabaseErrorMessage}`
          : "Supabase seeded successfully!"
        : "Supabase connection bypassed (missing credentials).",
      seededCountSupabase: supabaseSeeded.length,
      seededCountLocal: localChunksToSave.length,
      verification: {
        query: testQuery,
        source: verificationSource,
        matches: verificationResults.map(r => ({
          similarity: r.similarity,
          content: r.content
        }))
      }
    });

  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
