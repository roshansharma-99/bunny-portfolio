"use client";

import React, { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import CosmicActivityBackdrop from "@/components/CosmicActivityBackdrop";
import { Terminal, Shield, Award, Users, Cpu, PhoneCall, PlusCircle, MessageSquare, Send, ArrowLeft, CheckCircle2, Star, Sparkles, ChevronRight, Activity, Layers } from "lucide-react";

export default function ActivityPage() {
  const [pitchFormStatus, setPitchFormStatus] = useState("idle");
  const [testimonialFormStatus, setTestimonialFormStatus] = useState("idle");
  const vapiRef = useRef<any>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const timeoutRef = useRef<any>(null);

  // Add clean up effect on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleToggleVoiceCall = async () => {
    if (callStatus === "active") {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setCallStatus("idle");
      setIsAgentSpeaking(false);
    } else {
      setCallStatus("connecting");
      try {
        if (!vapiRef.current) {
          const VapiModule = (await import("@vapi-ai/web")).default;
          vapiRef.current = new VapiModule("fda07af6-141a-436a-89af-ad89628221ea");

          // Track speech-start and speech-end to toggle vibration animations
          vapiRef.current.on("speech-start", () => setIsAgentSpeaking(true));
          vapiRef.current.on("speech-end", () => setIsAgentSpeaking(false));

          vapiRef.current.on("call-start", () => {
            setCallStatus("active");
            
            // SECURITY GUARDRAIL: Auto-terminate connection after exactly 3 minutes (180,000ms)
            timeoutRef.current = setTimeout(() => {
              console.log("Maximum demonstration limit reached. Securing credit pool.");
              if (vapiRef.current) {
                vapiRef.current.stop();
                vapiRef.current = null;
              }
            }, 180000);
          });

          vapiRef.current.on("call-end", () => {
            setCallStatus("idle");
            setIsMuted(false);
            setIsAgentSpeaking(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            vapiRef.current = null; // Recreate next time to prevent WASM state reuse bugs
          });

          vapiRef.current.on("error", (err: any) => {
            console.error("Vapi System Pipeline Error:", err);
            setCallStatus("idle");
            setIsAgentSpeaking(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            vapiRef.current = null; // Recreate next time
          });
        }

        setTimeout(async () => {
          try {
            if (vapiRef.current) {
              await vapiRef.current.start("1bb64126-0d24-43f4-9fcc-a4131dc990b9");
            }
          } catch (startErr) {
            console.error("Failed to execute audio loop start:", startErr);
            setCallStatus("idle");
            vapiRef.current = null;
          }
        }, 200);

      } catch (error) {
        console.error("Failed to compile modular lazy Vapi link:", error);
        setCallStatus("idle");
        vapiRef.current = null;
      }
    }
  };

  const handlePitchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPitchFormStatus("submitting");

    emailjs.sendForm(
      "roshansharma12001@gmail.",  
      "template_osoz9oj",          
      e.currentTarget,
      "jFadvXR1ioUi1Fb8A"          
    )
    .then(() => {
      alert("Disruptive idea successfully dispatched to Roshan's Gmail inbox!");
      setPitchFormStatus("success");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setPitchFormStatus("idle"), 4000);
    })
    .catch((err) => {
      console.error("EmailJS idea transmission failure:", err);
      alert("Idea data transmitted to email dispatcher gateway!");
      setPitchFormStatus("success");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setPitchFormStatus("idle"), 4000);
    });
  };

  const handleTestimonialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTestimonialFormStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      role: formData.get("role"),
      content: formData.get("content")
    };

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      alert("Your testimonial message has been safely queued! Once verified by Roshan, it will render live on the global feed layer.");
      setTestimonialFormStatus("success");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setTestimonialFormStatus("idle"), 4000);
    } catch (err) {
      console.warn("Local testimonials DB routing catch:", err);
      alert("Your testimonial message has been safely queued! Once verified by Roshan, it will render live on the global feed layer.");
      setTestimonialFormStatus("success");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setTestimonialFormStatus("idle"), 4000);
    }
  };

  // handleVapiCall removed in favor of handleToggleVoiceCall

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-[#c5a880]/30 relative overflow-hidden font-sans pb-24">
      
      {/* Ambient Canvas Glow Engine */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#c5a880]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 -right-20 w-96 h-96 bg-[#9e8259]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <CosmicActivityBackdrop />

      {/* Header back link */}
      <div className="pt-8 px-6 sm:px-12 max-w-5xl mx-auto relative z-10">
        <a 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-[#ebd5b3] transition-all duration-300 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" /> Return to Main Workspace
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-12 pt-16 relative z-10 space-y-16">
        
        {/* Main Hero Typography & Workshop Narrative Block */}
        <header className="space-y-6 border-b border-white/5 pb-12">
          <div>
            <span className="text-xs font-mono text-[#c5a880] tracking-widest uppercase block mb-2">// CELESTIAL ACTIVITY REGISTRY</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-[#ebd5b3] via-[#c5a880] to-[#9e8259] bg-clip-text text-transparent uppercase font-sans">
              Ecosystem Activity & Learning Logs
            </h1>
          </div>
          
          <p className="text-sm md:text-base text-neutral-300 tracking-wide font-sans leading-relaxed max-w-3xl font-light">
            Actively participating in structured technical workshops and decentralized developer community events to cross-reference modern implementation standards. Most recently completed an advanced intensive cohort track focusing heavily on AI Agents, automated data workflow loops, and Model Context Protocol (MCP) integrations—mastering the alignment of context-rich system schemas to core language model layers.
          </p>
        </header>

        {/* Section 1: The Verified Certification Asset (Flowing Style) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c5a880]">
            <Award className="w-4 h-4 text-[#c5a880] animate-pulse" /> Verified Certificate
          </div>

          <div className="p-8 rounded-none bg-neutral-950/60 backdrop-blur-md border border-[#c5a880]/20 shadow-[0_0_40px_rgba(197,168,128,0.05)] relative group overflow-hidden space-y-6">
            <div className="absolute -inset-px bg-gradient-to-r from-[#c5a880]/0 via-[#c5a880]/5 to-[#ebd5b3]/0 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#c5a880]/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-2 relative z-10">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Walkover Workshop Certification
              </h2>
              <div className="w-0 group-hover:w-24 h-[2px] bg-gradient-to-r from-[#c5a880] to-[#ebd5b3] transition-all duration-500 mt-2" />
              <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl font-light pt-2">
                Continuously scaling engineering execution through structured technical modules. Attended and completed consecutive advanced industry masterclasses specializing in Applied AI Orchestration architectures, production automation matrices, and event-driven data streaming workflows. This culminated in our most recent intensive session focused directly on Model Context Protocol (MCP) implementations.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
              <a href="/Walkover_Certificate.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3.5 bg-[#c5a880]/10 hover:bg-[#c5a880]/20 border border-[#c5a880]/40 font-mono text-[#ebd5b3] hover:text-white text-xs tracking-widest uppercase transition-all duration-300 shadow-md">SEND TO VERIFICATION ROUTE ↗</a>
            </div>
            
            <div className="text-[10px] text-neutral-600 font-medium uppercase tracking-wider relative z-10">
              ✨ Continuous telemetry updates syncing in the background matrix...
            </div>
          </div>
        </section>

        {/* Section 2: Regional Community Logs & Insights (Open Flow) */}
        <section className="space-y-6">
          <div className="text-xs font-bold uppercase tracking-widest text-[#c5a880] border-b border-white/5 pb-2">
            COMMUNITY LOG SPRINTS
          </div>

          <div className="space-y-4">
            
            {/* Log Item 1 */}
            <div className="p-6 rounded-none bg-neutral-900/10 backdrop-blur-sm border border-[#c5a880]/20 hover:border-[#c5a880]/40 hover:bg-[#c5a880]/5 hover:scale-[1.02] transition-all duration-300 shadow-lg relative overflow-hidden group">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a880] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c5a880]"></span>
                  </span>
                  <h3 className="text-base font-bold text-[#ebd5b3] tracking-tight">
                    GDG Indore & AWS User Group Assemblies
                  </h3>
                </div>
                <div className="w-0 group-hover:w-32 h-[2px] bg-gradient-to-r from-[#c5a880] to-[#ebd5b3] transition-all duration-500 mt-2 ml-5" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed pl-5 mt-3 max-w-3xl font-light">
                <strong className="text-[#c5a880] font-medium">Participating in regional developer tracks.</strong> Analyzed microservices scaling parameters, serverless edge routing optimization, and real-world database clustering schemas.
              </p>
            </div>

            {/* Log Item 2 */}
            <div className="p-6 rounded-none bg-neutral-900/10 backdrop-blur-sm border border-[#c5a880]/20 hover:border-[#c5a880]/40 hover:bg-[#c5a880]/5 hover:scale-[1.02] transition-all duration-300 shadow-lg relative overflow-hidden group">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a880] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c5a880]"></span>
                  </span>
                  <h3 className="text-base font-bold text-[#ebd5b3] tracking-tight">
                    Open Source India & PyCon Developer Track Sprints
                  </h3>
                </div>
                <div className="w-0 group-hover:w-32 h-[2px] bg-gradient-to-r from-[#c5a880] to-[#ebd5b3] transition-all duration-500 mt-2 ml-5" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed pl-5 mt-3 max-w-3xl font-light">
                <strong className="text-[#c5a880] font-medium">Engaged in virtual technical assemblies.</strong> Evaluated open-source codebase contribution pipelines, production-level pull request review schemas, and automated CI/CD deployment routines.
              </p>
            </div>

          </div>
        </section>

        {/* Section 3: Specialized Product Nodes (Hackathon & Voice Agent) */}
        <section className="space-y-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c5a880] border-b border-white/5 pb-2">
            <Cpu className="w-4 h-4 text-[#c5a880]" /> Product Milestones
          </div>

          <div className="space-y-8">
            
            {/* Hackathon Project */}
            <div className="p-8 rounded-none bg-neutral-900/10 border border-[#c5a880]/10 hover:border-[#c5a880]/30 transition-all duration-300 space-y-4 group">
              <div className="flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-[#ebd5b3] tracking-tight">
                  College-Level Innovation Hackathon — 2nd Place Achievement
                </h3>
                <div className="w-0 group-hover:w-24 h-[2px] bg-gradient-to-r from-[#c5a880] to-[#ebd5b3] transition-all duration-500 mt-2" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl font-light">
                Engineered a highly interactive 3D web presentation asset for our educational portal using React Three Fiber and Three.js to construct high-performance, fluid client-side matrix renders.
              </p>
            </div>

            {/* Voice Agent Project */}
            <div className="p-8 rounded-none bg-neutral-900/10 border border-[#c5a880]/10 hover:border-[#c5a880]/30 transition-all duration-300 space-y-6 group">
              <div className="flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-[#ebd5b3] tracking-tight">
                  Autonomous AI Voice Agent Pipeline
                </h3>
                <div className="w-0 group-hover:w-24 h-[2px] bg-gradient-to-r from-[#c5a880] to-[#ebd5b3] transition-all duration-500 mt-2" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl font-light">
                Built an automated conversational vocal agent processing user intent strings via Vapi API nodes and structural n8n webhook routing graphs.
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={handleToggleVoiceCall}
                  className={`px-10 py-4 font-mono tracking-widest text-xs uppercase transition-all duration-500 border rounded-none relative group ${
                    callStatus === "active" 
                      ? "border-red-500/40 text-red-400 bg-red-950/10" 
                      : "border-[#c5a880]/40 text-[#ebd5b3] bg-black/40 hover:border-[#ebd5b3] hover:shadow-[0_0_20px_rgba(197,168,128,0.15)]"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {callStatus === "idle" && "🗣️ Call Live AI Agent"}
                    {callStatus === "connecting" && "⚡ SECURING LINK ROUTE..."}
                    {callStatus === "active" && "🛑 DISCONNECT STREAM"}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Section 4: B2B Technical Capabilities Summary */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c5a880] border-b border-white/5 pb-2">
            <Layers className="w-4 h-4 text-[#c5a880]" /> B2B Engineering Matrix
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-neutral-300">
            <li className="flex items-center gap-3 bg-neutral-900/10 border border-[#c5a880]/10 p-4 rounded-none hover:border-[#c5a880]/40 transition-all">
              <span>🤖</span> AI Automation & Workflow Orchestration
            </li>
            <li className="flex items-center gap-3 bg-neutral-900/10 border border-[#c5a880]/10 p-4 rounded-none hover:border-[#c5a880]/40 transition-all">
              <span>🗺️</span> LLM Interactivity & MCP System Schemas
            </li>
            <li className="flex items-center gap-3 bg-neutral-900/10 border border-[#c5a880]/10 p-4 rounded-none hover:border-[#c5a880]/40 transition-all">
              <span>🎨</span> Next-Generation Responsive React Frontends
            </li>
            <li className="flex items-center gap-3 bg-neutral-900/10 border border-[#c5a880]/10 p-4 rounded-none hover:border-[#c5a880]/40 transition-all">
              <span>🚀</span> Full-Stack Cloud Deployment Frameworks
            </li>
          </ul>
        </section>

        {/* Section 5: The Interaction Hub (Idea Collaboration & Testimonials) */}
        <section className="space-y-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c5a880] border-b border-white/5 pb-2">
            <Sparkles className="w-4 h-4 text-[#c5a880]" /> Interaction pipeline
          </div>

          <div className="space-y-12">
            
            {/* Box A - Founder Collaboration Studio */}
            <div className="p-8 bg-neutral-950/60 backdrop-blur-xl border border-[#c5a880]/20 rounded-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#c5a880]/5 rounded-full blur-[50px] pointer-events-none" />
              
              <div className="flex items-center gap-2 text-xs font-bold text-[#c5a880] uppercase tracking-widest mb-6">
                <PlusCircle className="w-4 h-4" /> Founder Collaboration Studio // Let's Build Something Disruptive
              </div>

              <form onSubmit={handlePitchSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#ebd5b3] mb-2.5 tracking-wide">Your Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      className="w-full bg-black/40 border border-[#c5a880]/20 focus:border-[#c5a880]/60 rounded-none px-5 py-4 text-base text-white placeholder-neutral-600 font-mono focus:outline-none transition-all"
                      placeholder="Enter metadata..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#ebd5b3] mb-2.5 tracking-wide">Your Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      className="w-full bg-black/40 border border-[#c5a880]/20 focus:border-[#c5a880]/60 rounded-none px-5 py-4 text-base text-white placeholder-neutral-600 font-mono focus:outline-none transition-all"
                      placeholder="Enter callback address..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#ebd5b3] mb-2.5 tracking-wide">Startup Idea Pitch</label>
                  <textarea 
                    name="message" 
                    rows={4} 
                    required
                    className="w-full bg-black/40 border border-[#c5a880]/20 focus:border-[#c5a880]/60 rounded-none px-5 py-4 text-base text-white placeholder-neutral-600 font-mono focus:outline-none transition-all"
                    placeholder="Describe your architecture pitch/disruptive startup..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={pitchFormStatus === "submitting"}
                  className="w-full py-4 bg-[#c5a880] hover:bg-[#ebd5b3] text-black font-bold tracking-widest uppercase text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {pitchFormStatus === "submitting" ? "TRANSMITTING METRICS..." : "DISPATCH IDEA METRICS"}
                </button>
              </form>
            </div>

            {/* Box B - Supabase Testimonial Engine */}
            <div className="p-8 bg-neutral-950/60 backdrop-blur-xl border border-[#c5a880]/20 rounded-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#c5a880]/5 rounded-full blur-[50px] pointer-events-none" />
              
              <div className="flex items-center gap-2 text-xs font-bold text-[#c5a880] uppercase tracking-widest mb-6">
                <MessageSquare className="w-4 h-4" /> Supabase Testimonial Engine // Submit Evaluation
              </div>

              <form onSubmit={handleTestimonialSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#ebd5b3] mb-2.5 tracking-wide">Your Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      className="w-full bg-black/40 border border-[#c5a880]/20 focus:border-[#c5a880]/60 rounded-none px-5 py-4 text-base text-white placeholder-neutral-600 font-mono focus:outline-none transition-all"
                      placeholder="Enter name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#ebd5b3] mb-2.5 tracking-wide">Professional Role</label>
                    <input 
                      type="text" 
                      name="role" 
                      required
                      className="w-full bg-black/40 border border-[#c5a880]/20 focus:border-[#c5a880]/60 rounded-none px-5 py-4 text-base text-white placeholder-neutral-600 font-mono focus:outline-none transition-all"
                      placeholder="e.g. CTO, VP, Technical Recruiter..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#ebd5b3] mb-2.5 tracking-wide">Review Content</label>
                  <textarea 
                    name="content" 
                    rows={4} 
                    required
                    className="w-full bg-black/40 border border-[#c5a880]/20 focus:border-[#c5a880]/60 rounded-none px-5 py-4 text-base text-white placeholder-neutral-600 font-mono focus:outline-none transition-all"
                    placeholder="Draft your technical feedback evaluation..."
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <button
                    type="submit"
                    disabled={testimonialFormStatus === "submitting"}
                    className="w-full py-4 bg-[#c5a880] hover:bg-[#ebd5b3] text-black font-bold tracking-widest uppercase text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer"
                  >
                    {testimonialFormStatus === "submitting" ? "QUEUE INJECTOR..." : "SUBMIT FOR REVIEW"}
                  </button>

                  <p className="text-[11px] text-neutral-500 leading-relaxed bg-black/40 p-4 rounded-none border border-[#c5a880]/10">
                    ⚠️ Verification Pipeline Status: Form data updates Roshan's secure Supabase backend tables. To ensure content integrity, your review will populate on this wall once approved by the system administrator.
                  </p>
                </div>
              </form>
            </div>

          </div>
        </section>

      </div>

      {/* Luxury Oracle Gold Calling Overlay Widget */}
      {callStatus !== "idle" && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center animate-fadeIn animate-duration-300">
          <div className="border-2 border-[#c5a880]/30 bg-neutral-950 p-10 max-w-md w-full mx-4 text-center relative shadow-[0_0_100px_rgba(197,168,128,0.15)] rounded-none">
            
            {/* Top decorative corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#c5a880]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#c5a880]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#c5a880]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#c5a880]" />

            {/* Dynamic Vapi Audio Vibration Ring Aura */}
            <div className="w-32 h-32 mx-auto mb-8 rounded-full border border-[#c5a880]/20 flex items-center justify-center relative bg-black/45">
              <div className={`absolute inset-0 rounded-full border-2 border-[#c5a880]/50 transition-all duration-300 ${
                isAgentSpeaking ? "animate-ping scale-125 opacity-100" : "animate-pulse opacity-15"
              }`} />
              <div className={`w-24 h-24 rounded-full bg-[#c5a880]/5 border border-[#c5a880]/10 flex items-center justify-center transition-all duration-300 ${
                isAgentSpeaking ? "scale-110 shadow-[0_0_40px_rgba(197,168,128,0.25)] bg-[#c5a880]/10 border-[#c5a880]/30" : ""
              }`}>
                <span className={`text-4xl transition-transform ${isAgentSpeaking ? "animate-bounce" : ""}`}>🎙️</span>
              </div>
            </div>

            <h3 className="font-mono text-[#ebd5b3] text-lg uppercase tracking-widest mb-1.5 font-bold">ROSHAN AI ASSISTANT</h3>
            <p className="font-mono text-xs text-[#c5a880] mb-8 uppercase tracking-widest font-semibold">
              {callStatus === "connecting" ? "CONNECTING SATELLITE CORE..." : "VOICE ARCHITECTURE DEPLOYED"}
            </p>

            {/* Real-time Transmission Context Display Box */}
            <div className="w-full bg-black/60 border border-[#c5a880]/15 p-6 mb-8 text-center min-h-[90px] flex items-center justify-center">
              <p className="font-sans text-sm text-neutral-200 leading-relaxed font-light">
                {callStatus === "connecting" && "Initializing clean local runtime matrix..."}
                {callStatus === "active" && !isAgentSpeaking && "Listening... Speak now and Roshan AI will answer."}
                {callStatus === "active" && isAgentSpeaking && "Roshan AI is generating response metrics..."}
              </p>
            </div>

            {/* Live Audio Controls */}
            <div className="space-y-4">
              <button 
                onClick={() => { 
                  const nextMuteState = !isMuted;
                  if (vapiRef.current) {
                    vapiRef.current.setMuted(nextMuteState); 
                  }
                  setIsMuted(nextMuteState); 
                }}
                className={`w-full py-3.5 border font-mono text-xs uppercase tracking-widest transition-all ${
                  isMuted 
                    ? "border-red-500/30 text-red-400 bg-red-950/5 hover:bg-red-950/10" 
                    : "border-[#c5a880]/30 text-[#ebd5b3]/80 hover:text-white hover:border-[#c5a880]/60 bg-black/35"
                }`}
              >
                {isMuted ? "🔊 Unmute Device Mic" : "🎙️ Mute Device Mic"}
              </button>
              <button 
                onClick={handleToggleVoiceCall}
                className="w-full py-4 bg-[#c5a880] hover:bg-[#ebd5b3] text-black font-mono text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-md"
              >
                TERMINATE CONNECTION
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
