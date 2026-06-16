# 🐰 Bunny Portfolio — Advanced Next.js AI Agentic Showcase

![](https://img.shields.io/badge/Status-Production--Ready-brightgreen?style=flat-square)
![](https://img.shields.io/badge/Architecture-RAG_&_Agentic-blueviolet?style=flat-square)
![](https://img.shields.io/badge/Live_Demo-roshansharma.co.in-orange?style=flat-square)

> A high-performance, immersive portfolio application built on Next.js, featuring real-time conversational AI, RAG-driven knowledge retrieval, voice guidance tours, and interactive AI voice calling capabilities.

---

## ⚡ Core Architectural Features

### 🤖 Intelligent Bunny AI Chat (Bilingual RAG Setup)
* **Vector Knowledge Retrieval:** User background data is split into semantic chunks and embedded inside a high-dimensional **Supabase Vector Database** utilizing vector similarity matching (`pgvector`).
* **Bilingual Orchestration:** Integrated with the **Gemini API** for cognitive processing alongside **Sarvam AI API** to provide fluent, low-latency contextual conversations in both English and Hindi.
* **Bi-directional Voice Assistance:** Equipped with speech-to-text input processing and an integrated conversational feedback system that verbally answers user queries dynamically.

### 📞 AI Telephonic Voice Agent
* Powered by a **Vapi integration** to bridge real-time web-call streaming capabilities, letting recruiters place a direct telephonic or digital web call directly to an AI agent trained comprehensively on my professional profile.

### 🎙️ Pre-Rendered Audio Guide Tour
* To bypass runtime LLM token constraints and eliminate latency, the application includes a fully guided verbal interface tour utilizing optimized voice scripts synthesized through **ElevenLabs**. 

### 💼 Enterprise Product Features
* **Direct Scheduling Engine:** Zero friction calendar scheduling layers using a clean **Calendar API** mapping to allow recruiters to book interview slots instantly.
* **Direct Contact Channels:** Form processing handled safely via client-side messaging pipelines utilizing **EmailJS**.
* **Financial Layer Integration:** Direct peer-to-peer transactional support handling rapid native **UPI payment options** directly within the web environment.

---

## 🛠️ Built with the Modern Stack

* **Frontend Framework:** Next.js (App Router), React, TypeScript, Tailwind CSS, Specialized CSS Animation Components.
* **AI & Orchestration Ecosystem:** Gemini Pro, Sarvam AI, Vapi Voice Gateways, ElevenLabs Audio Synthesis.
* **Database & Vector Memory:** Supabase (PostgreSQL), Vector Embeddings Store.
* **External Layer Integrations:** EmailJS, Google Calendar Core Integration, Native UPI Web Gateway Protocols.

---

## ⚙️ Local Development Environment Setup

```bash
# 1. Clone the repository architecture
git clone [https://github.com/roshansharma-99/bunny-portfolio.git](https://github.com/roshansharma-99/bunny-portfolio.git)

# 2. Enter the workspace directory
cd bunny-portfolio

# 3. Securely set up your environment properties
# Create a local environment variables configuration file (.env.local) and populate it safely:
# NEXT_PUBLIC_GEMINI_API_KEY=your_key
# NEXT_PUBLIC_SARVAM_AI_KEY=your_key
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_endpoint
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
# NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_id

# 4. Install production dependencies
npm install

# 5. Run the high-performance local development loop
npm run dev
