export type Project = {
  name: string;
  stack: string[];
  desc: string;
  skills: string[];
  image?: string | null;
  videoUrl?: string | null;
  githubLink?: string | null;
  liveLink?: string | null;
};

export const projects: Project[] = [
  { 
    name: "BUNNY AI", 
    stack: ["NEXT.JS", "THREE.JS", "AI AGENT"], 
    desc: "Custom highly interactive 3D portfolio and autonomous personal assistant ecosystem.",
    skills: ["Next.js", "Tailwind CSS", "JavaScript / JS", "REACT.js", "Antigravity", "Generative AI", "AI Automation", "Cursor", "MCP"],
    image: "/projectImages/Bunny-AI.png",
    videoUrl: null,
    githubLink: "https://github.com/roshansharma-99/Bunny.AI",
    liveLink: null
  },
  { 
    name: "ORACLE EYE", 
    stack: ["REACT", "PYTHON", "SUPABASE"], 
    desc: "Real-time AI vision stream analyzing high-frequency data matrices.",
    skills: ["REACT.js", "Python", "Supabase", "Vercel", "Data Analytics", "LLM Orchestration", "Node.js"],
    image: "/projectImages/oracle-eye.png",
    videoUrl: null,
    githubLink: "https://github.com/roshansharma-99/oracle-eye-live",
    liveLink: "https://oracle-eye-live.vercel.app/"
  },
  { 
    name: "AI RECRUITER PORTAL", 
    stack: ["NEXT.JS", "OPENAI", "SUPABASE"], 
    desc: "Autonomous candidate screening platform leveraging structured cognitive evaluation matrices.",
    skills: ["Next.js", "Tailwind CSS", "REACT.js", "Supabase", "AI Automation", "Generative AI", "LLM Orchestration"],
    image: "/projectImages/ai-recruiter-portal.png",
    videoUrl: null,
    githubLink: "https://github.com/roshansharma-99/ai-recruiter-portal",
    liveLink: "https://ai-recruiter-portal.vercel.app/"
  },
  { 
    name: "PORTFOLIO RAG SYSTEM", 
    stack: ["TYPESCRIPT", "VECTOR DB", "PRISMA"], 
    desc: "Semantic search engine enabling real-time dialogue querying of technical documentation.",
    skills: ["Next.js", "Tailwind CSS", "JavaScript / JS", "REACT.js", "Supabase", "LLM Orchestration", "Prompt Engineering", "RAG"],
    image: "/projectImages/portfolio-Rag.png",
    videoUrl: null,
    githubLink: null,
    liveLink: null
  },
  { 
    name: "FUTURE VENTURE", 
    stack: ["EXPERIMENTAL", "WEBGL"], 
    desc: "Undisclosed stealth project bridging cognitive architectures and spatial computing.",
    skills: ["JavaScript / JS", "Next.js", "REACT.js", "Java", "Python", "n8n", "Zapier", "LLM Orchestration", "AI Automation"],
    image: "/projectImages/future-venture.png",
    videoUrl: null,
    githubLink: null,
    liveLink: null
  }
];
