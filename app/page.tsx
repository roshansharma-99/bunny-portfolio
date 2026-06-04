"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ScrollVideoBackdrop from "@/components/ScrollVideoBackdrop";
import MagneticButton from "@/components/MagneticButton";
import CalendarWidget from "@/components/CalendarWidget";
import FuelTheCode from "@/components/FuelTheCode";
import BunnyAIChat from "@/components/BunnyAIChat";
import { projects, type Project } from "@/data/projectsConfig";
import { AudioProvider, useAudio } from "@/hooks/useAudio";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 9 18v4"></path>
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
      <line x1="7" y1="2" x2="7" y2="22"></line>
      <line x1="17" y1="2" x2="17" y2="22"></line>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <line x1="2" y1="7" x2="7" y2="7"></line>
      <line x1="2" y1="17" x2="7" y2="17"></line>
      <line x1="17" y1="17" x2="22" y2="17"></line>
      <line x1="17" y1="7" x2="22" y2="7"></line>
    </svg>
  );
}

const masterSkills = [
  "JavaScript / JS",
  "REACT.js",
  "Next.js",
  "Java",
  "Python",
  "Supabase",
  "Vercel",
  "AI Automation",
  "Generative AI",
  "Data Analytics",
  "LLM Orchestration",
  "Prompt Engineering",
  "n8n",
  "Zapier",
  "Antigravity",
  "Cursor",
  "MCP",
  "RAG",
  "Tailwind CSS",
  "Node.js"
];

function TypewriterText({ text, start, speed = 40, isLiquid = false }: { text: string; start: boolean; speed?: number; isLiquid?: boolean }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    if (!start) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      

      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, start, speed]);
  
  return (
    <span className={`inline-block min-h-[1.5em] ${isLiquid ? "glossy-text" : ""}`}>
      {displayedText}
      {start && displayedText.length < text.length ? <span className="animate-pulse font-light text-white/50">|</span> : ""}
    </span>
  );
}

function HomeContent() {
  const { playAudio, unmuteAndStart, isPlaying, currentPlaying } = useAudio();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnmuteOverlay, setShowUnmuteOverlay] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
          setShowUnmuteOverlay(true);
        }, 300);
      }
      setLoadingProgress(currentProgress);
    }, 60);

    return () => clearInterval(interval);
  }, []);

  const handleStartExperience = () => {
    unmuteAndStart();
    setShowUnmuteOverlay(false);
    setIsStarted(true);
  };

  const [isStarted, setIsStarted] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("idle");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => {
      setFormStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setFormStatus("idle"), 4000);
    }, 1500);
  };

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || navigator.vendor || (window as any).opera : '';
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());
    
    if (isMobile) {
      window.location.href = `mailto:roshansharma12001@gmail.com?subject=Software%20Engineering%20/%20Core%20Developer%20Opportunity&body=Hello%20Roshan,%0A%0AI%20explored%20your%20portfolio%20and%20am%20impressed%20by%20your%20custom%20AI%20integrations%20and%20full-stack%20sprints.%20I'd%20love%20to%20connect%20and%20discuss%20potential%20roles%20and%20interview%20scheduling.%0A%0ABest%20regards,%0A[Your%20Name]`;
    } else {
      window.open(
        `https://mail.google.com/mail/u/0/?tf=cm&to=roshansharma12001@gmail.com&su=Software%20Engineering%20/%20Core%20Developer%20Opportunity&body=Hello%20Roshan,%0A%0AI%20explored%20your%20portfolio%20and%20am%20impressed%20by%20your%20custom%20AI%20integrations%20and%20full-stack%20sprints.%20I'd%20love%20to%20connect%20and%20discuss%20potential%20roles%20and%20interview%20scheduling.%0A%0ABest%20regards,%0A[Your%20Name]`,
        '_blank'
      );
    }
  };
  
  const containerRef = useRef<HTMLElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const startAutoShuffle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDeckIndex((prev) => (prev + 1) % projects.length);
    }, 4500);
  };

  const stopAutoShuffle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
    startAutoShuffle();
  };

  useEffect(() => {
    if (isStarted && !selectedProject) {
      startAutoShuffle();
    }
    return () => stopAutoShuffle();
  }, [isStarted, selectedProject]);

  // Intersection Observer for scroll audio triggers
  useEffect(() => {
    if (!isStarted) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.35,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const className = entry.target.className;
          if (className.includes("project-section")) {
            playAudio("projects");
          } else if (className.includes("contact-section")) {
            playAudio("contact");
          } else if (className.includes("fuel-section")) {
            playAudio("fuel");
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const projectEl = document.querySelector(".project-section");
    const contactEl = document.querySelector(".contact-section");
    const fuelEl = document.querySelector(".fuel-section");

    if (projectEl) observer.observe(projectEl);
    if (contactEl) observer.observe(contactEl);
    if (fuelEl) observer.observe(fuelEl);

    return () => {
      observer.disconnect();
    };
  }, [isStarted, playAudio]);

  // Project End trigger watcher
  useEffect(() => {
    if (isStarted && deckIndex === projects.length - 1) {
      playAudio("projectsEnd");
    }
  }, [deckIndex, isStarted, playAudio]);

  // Bunny AI Chat trigger watcher
  useEffect(() => {
    if (isStarted && isChatOpen) {
      playAudio("chat");
    }
  }, [isChatOpen, isStarted, playAudio]);

  // One-time auto-scroll trigger after intro sequence finishes
  const prevPlayingRef = useRef<string | null>(null);
  const hasAutoScrolledRef = useRef(false);

  useEffect(() => {
    if (prevPlayingRef.current === "intro2" && currentPlaying === null && !hasAutoScrolledRef.current) {
      const projectSec = document.querySelector(".project-section");
      if (projectSec) {
        projectSec.scrollIntoView({ behavior: "smooth" });
        hasAutoScrolledRef.current = true;
      }
    }
    prevPlayingRef.current = currentPlaying;
  }, [currentPlaying]);

  useEffect(() => {
    if (!isStarted || typeof window === "undefined") return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "+=350px",
        pin: true,        // Forces the window to lock completely in place
        scrub: 1,         // Binds the transitions directly to the scroll velocity
        invalidateOnRefresh: true,
      }
    });

    // Animate Text Out, Avatar Out and Background Glow transformations on scroll
    tl.to(".hero-text-content", { opacity: 0, y: -65, duration: 0.5 });
    tl.to(".hero-avatar-content", { opacity: 0, y: -65, duration: 0.5 }, "<");
    tl.to(".bg-glow-1", { scale: 1.25, opacity: 0.04, duration: 0.5 }, "<")
      .to(".bg-glow-2", { scale: 0.75, opacity: 0.02, duration: 0.5 }, "<");

    return () => {
      // Clean up the trigger context on unmount to prevent page freezes
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [isStarted]);



  useGSAP(() => {
    if (!isStarted || typeof window === "undefined") return;

    gsap.fromTo(".intro-line", {
      opacity: 0,
      y: 20
    }, {
      opacity: 1,
      y: 0,
      duration: 1.5,
      stagger: 0.3,
      ease: "power3.out",
      delay: 0.2
    });

    gsap.fromTo(".project-section", {
      opacity: 0,
      scale: 1.05 
    }, {
      opacity: 1,
      scale: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".project-section",
        start: "top bottom",
        end: "center center",
        scrub: 1
      }
    });

  }, { scope: containerRef, dependencies: [isStarted] });

  const handleNextProject = () => {
    setDeckIndex((prev) => (prev + 1) % projects.length);
    startAutoShuffle();
  };

  const handlePrevProject = () => {
    setDeckIndex((prev) => (prev - 1 + projects.length) % projects.length);
    startAutoShuffle();
  };

  const getCardLayout = (relIndex: number) => {
    switch(relIndex) {
      case 0: return { x: 0, scale: 1, rotateY: 0, zIndex: 50, opacity: 1, translateZ: 0 }; // Center
      case 1: return { x: -60, scale: 0.93, rotateY: 6, zIndex: 40, opacity: 1, translateZ: -100 }; // Left 1
      case 2: return { x: -120, scale: 0.86, rotateY: 12, zIndex: 30, opacity: 1, translateZ: -200 }; // Left 2
      case 3: return { x: 120, scale: 0.86, rotateY: -12, zIndex: 30, opacity: 1, translateZ: -200 }; // Right 2
      case 4: return { x: 60, scale: 0.93, rotateY: -6, zIndex: 40, opacity: 1, translateZ: -100 }; // Right 1
      default: return { x: 0, scale: 0.5, rotateY: 0, zIndex: 0, opacity: 0, translateZ: -300 };
    }
  };

  const handleFullscreen = () => {
    const el = videoContainerRef.current as any;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  };

  return (
    <main id="main-scroll" ref={containerRef} className="relative w-[100vw] min-h-[100vh] overflow-x-hidden bg-[#030014]">
      
      {/* Premium Fixed Floating Glass Capsule Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-[#030014]/40 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full shadow-lg">
          {/* Left Sleek Interactive Logo */}
          <div className="flex items-center space-x-4">
            <span 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                playAudio("easterEgg");
              }} 
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent hover:from-purple-400 hover:to-indigo-400 transition-all duration-500 cursor-pointer"
            >
              Roshan Sharma
            </span>
            {/* Dynamic Voice Pulse Indicator */}
            <div className="flex items-end space-x-1 h-4 select-none" title="Voice Guide Representative Pulse">
              {[0, 1, 2, 3, 4].map((bar) => (
                <motion.div
                  key={bar}
                  animate={isPlaying ? { height: ["20%", "100%", "20%"] } : { height: "20%" }}
                  transition={{
                    repeat: Infinity,
                    duration: isPlaying ? 0.5 + (bar % 3) * 0.15 : 0,
                    ease: "easeInOut"
                  }}
                  className="w-0.5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                  style={{ minHeight: "20%" }}
                />
              ))}
            </div>
          </div>
          
          {/* Right Desktop Links */}
          <div className="hidden md:flex items-center space-x-2">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex items-center text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-full hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </button>
            <button 
              onClick={() => document.querySelector('.project-section')?.scrollIntoView({ behavior: 'smooth' })} 
              className="flex items-center text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-full hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              Projects
            </button>
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="flex items-center text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-full hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
              Bunny AI Chat
              <span className="relative flex h-2 w-2 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
            <button 
              onClick={() => document.querySelector('.contact-section')?.scrollIntoView({ behavior: 'smooth' })} 
              className="flex items-center text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-full hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Contact
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-zinc-300 hover:text-white p-1 focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-20 left-6 right-6 bg-[#0c091f]/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col space-y-4"
            >
              <button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center text-left text-sm font-medium text-zinc-300 hover:text-purple-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Home
              </button>
              <button 
                onClick={() => {
                  document.querySelector('.project-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center text-left text-sm font-medium text-zinc-300 hover:text-purple-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                Projects
              </button>
              <button 
                onClick={() => {
                  setIsChatOpen(true);
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center text-left text-sm font-medium text-zinc-300 hover:text-purple-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/><path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/></svg>
                Bunny AI Chat
                <span className="relative flex h-2 w-2 ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>
              <button 
                onClick={() => {
                  document.querySelector('.contact-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }} 
                className="flex items-center text-left text-sm font-medium text-zinc-300 hover:text-purple-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                Contact
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Elevated Global Ambient Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle background grid pattern across the entire site */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:32px_32px]" />
        {/* Subtle violet/indigo radial glow - Top Left */}
        <div className="bg-glow-1 absolute top-[-15%] left-[-15%] w-[85vw] h-[85vw] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-[130px] transform-gpu" />
        {/* Secondary cyan/blue subtle glow - Middle Right */}
        <div className="bg-glow-2 absolute top-[35%] right-[-15%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-cyan-500/6 via-blue-500/4 to-transparent blur-[110px] transform-gpu" />
        {/* Large violet/purple radial glow behind the carousel - Bottom Left/Center */}
        <div className="absolute bottom-[-15%] left-[20%] w-[650px] h-[650px] rounded-full bg-purple-600/8 blur-[160px] transform-gpu" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes glossyReflection {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .glossy-text {
          background-image: linear-gradient(110deg, #ffffff 45%, rgba(255, 255, 255, 0.8) 49%, rgba(255, 255, 255, 1) 51%, #ffffff 55%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: glossyReflection 4s linear infinite;
        }
      `}} />

      {/* Hero Section */}
      <section className="hero-section flex items-center justify-center relative w-full min-h-[100vh] py-20 overflow-hidden">
        {isStarted && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-7xl mx-auto px-4 min-h-[75vh] z-10 relative">
            
            {/* Left Side: Text Column (col-span-7) */}
            <div className="lg:col-span-7 w-full flex flex-col justify-center text-left px-4 hero-text-content">
              <h1 className="intro-line text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter drop-shadow-2xl bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                <TypewriterText text="Roshan Sharma" start={isStarted} speed={80} />
              </h1>
              <div className="mt-6 sm:mt-10 max-w-2xl space-y-4 sm:space-y-6">
                <h2 className="intro-line text-sm sm:text-xl md:text-2xl font-semibold tracking-[0.15em] text-white uppercase drop-shadow-md">
                  AI Product Builder & Fullstack Engineer
                </h2>
                <p className="intro-line text-sm sm:text-lg md:text-xl font-light tracking-wide text-zinc-400 leading-relaxed max-w-xl">
                  Designing autonomous agents and intelligent digital ecosystems. Specializing in bridging the gap between deep learning architectures and high-performance user interfaces.
                </p>
              </div>
            </div>

            {/* Right Side: Avatar Wrapper (col-span-5) */}
            <div className="lg:col-span-5 w-full flex justify-center items-center relative hero-avatar-content">
              <div className="relative w-full max-w-[450px] aspect-[450/650] flex justify-center items-center">
                
                {/* Soft ambient purple backdrop glow */}
                <div className="absolute inset-0 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                
                <Image
                  src="/hero-avatar.webp"
                  alt="Roshan Sharma Avatar"
                  width={450}
                  height={650}
                  className="w-full h-auto object-contain max-h-[70vh]"
                  priority
                />
              </div>
            </div>

          </div>
        )}
      </section>

      {/* PROJECTS / EXPERIENCE Horizon Stack */}
      <section className="project-section relative w-full min-h-[100vh] flex flex-col justify-center items-center z-10 bg-transparent py-20 overflow-hidden">
        
        {/* Cinematic Layout Container */}
        <div 
          className="relative w-full max-w-[1600px] mx-auto px-8 z-10"
          onMouseEnter={stopAutoShuffle}
          onMouseLeave={() => { if (!selectedProject) startAutoShuffle(); }}
        >
          {/* Symmetrical Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mb-4 items-end">
            <div className="col-span-1 lg:col-span-7 flex justify-center">
              <div className="w-full max-w-[480px] text-left">
                <h2 className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-300 to-purple-600 font-extrabold tracking-wider text-2xl lg:text-3xl uppercase drop-shadow-lg select-none">
                  PROJECTS / EXPERIENCE
                </h2>
              </div>
            </div>
            <div className="col-span-1 lg:col-span-5 text-left">
              <h2 className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-300 to-purple-600 font-extrabold tracking-wider text-2xl lg:text-3xl uppercase drop-shadow-lg select-none">
                TECH STACK & CORE SKILLS
              </h2>
            </div>
          </div>

          {/* Split 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            
            {/* Desktop Only 3D Stack Carousel (lg:col-span-7) */}
            <div className="hidden lg:flex lg:col-span-7 w-full flex-col items-center justify-start relative pointer-events-auto" onClick={stopAutoShuffle}>
              <div 
                className="relative w-full max-w-[700px] h-[580px] flex items-center justify-center mx-auto"
                style={{ 
                  perspective: "1500px", 
                  transform: 'translateZ(0)', 
                  backfaceVisibility: 'hidden', 
                  willChange: 'transform, opacity' 
                }}
              >
                <AnimatePresence initial={false}>
                  {projects.map((proj, i) => {
                    const relIndex = (i - deckIndex + projects.length) % projects.length;
                    const layout = getCardLayout(relIndex);
                    const isActive = relIndex === 0;

                    return (
                      <div key={proj.name} className="project-card-wrapper absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: layout.zIndex, perspective: "1500px" }}>
                         <motion.div 
                          layout
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ 
                            x: layout.x, 
                            scale: layout.scale, 
                            rotateY: layout.rotateY,
                            z: layout.translateZ,
                            opacity: layout.opacity,
                            boxShadow: isActive 
                              ? '0 0 50px -12px rgba(139,92,246,0.55), 0 25px 50px -12px rgba(0,0,0,0.8)' 
                              : '0 4px 15px rgba(0,0,0,0.45)'
                          }}
                          transition={{ type: "spring", stiffness: 180, damping: 20 }}
                          className={`absolute w-full max-w-[480px] h-[540px] bg-[#0d0a16] border p-8 flex flex-col rounded-2xl transform-gpu transition-all duration-300 ${
                            isActive 
                              ? "pointer-events-auto border-violet-500/40 shadow-2xl z-50" 
                              : "pointer-events-none border-violet-500/20"
                          }`}
                        >
                        <div className={`w-full h-full flex flex-col transition-all duration-500 ${
                          isActive ? "blur-none opacity-100" : "blur-md pointer-events-none opacity-30"
                        }`}>
                          {/* Static Image Asset Slot */}
                          <div className="w-full h-[180px] bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden shrink-0">
                            {proj.image ? (
                              <img src={proj.image} alt={proj.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <>
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                                <span className="text-zinc-600 font-light tracking-widest text-[10px] uppercase z-10 text-center select-none">[ PROJECT_MEDIA_ASSET ]</span>
                              </>
                            )}
                          </div>

                          <div className="relative z-10 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{proj.name}</h3>
                              <p className="text-zinc-400 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                                {proj.desc}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {proj.stack.map((tech, idx) => (
                                  <span key={idx} className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1.5 bg-zinc-900 border border-zinc-700/50 text-zinc-300 rounded-md select-none">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-6 border-t border-zinc-800/50 mt-auto">
                              <div className="flex items-center gap-6 justify-center">
                                {proj.githubLink && (
                                  <a 
                                    href={proj.githubLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                                  >
                                    <GithubIcon className="w-4 h-4" />
                                    <span>GitHub</span>
                                  </a>
                                )}
                                {proj.liveLink && (
                                  <a 
                                    href={proj.liveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                                  >
                                    <ExternalLinkIcon className="w-4 h-4" />
                                    <span>Live Link</span>
                                  </a>
                                )}
                              </div>
                              
                              <button 
                                onClick={() => {
                                  if (proj.videoUrl) {
                                    setSelectedProject(proj);
                                  } else {
                                    alert("Walkthrough coming soon!");
                                  }
                                }}
                                className="flex items-center justify-center gap-2 text-white bg-white/10 hover:bg-white/20 transition-colors px-4 py-3 rounded-lg text-sm font-medium border border-white/10 w-full cursor-pointer"
                              >
                                <PlayIcon className="w-4 h-4" />
                                <span>Watch Walkthrough</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Horizontally centered navigation row right below card stack */}
              <div className="flex items-center justify-center gap-6 mt-4 pointer-events-auto">
                <MagneticButton 
                  onClick={handlePrevProject}
                  className="w-12 h-12 rounded-full bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center transition-all shadow-2xl group cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                </MagneticButton>
                
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest font-mono select-none">
                  {deckIndex + 1} / {projects.length}
                </span>

                <MagneticButton 
                  onClick={handleNextProject}
                  className="w-12 h-12 rounded-full bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center transition-all shadow-2xl group cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </MagneticButton>
              </div>
            </div>

            {/* Mobile/Tablet Only Vertical Cards Stack (flex flex-col lg:hidden) */}
            <div className="flex flex-col lg:hidden w-full space-y-8 items-center px-4 pointer-events-auto animate-fade-in">
              {projects.map((proj) => (
                <div 
                  key={proj.name} 
                  className="w-full max-w-[420px] bg-[#0d0a16] border border-violet-500/20 p-6 flex flex-col rounded-2xl shadow-xl"
                >
                  {/* Image Slot */}
                  <div className="w-full h-[180px] bg-zinc-900/60 border border-zinc-800/80 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden shrink-0">
                    {proj.image ? (
                      <img src={proj.image} alt={proj.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                        <span className="text-zinc-600 font-light tracking-widest text-[10px] uppercase z-10 text-center select-none">[ PROJECT_MEDIA_ASSET ]</span>
                      </>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{proj.name}</h3>
                      <p className="text-zinc-400 text-xs font-light leading-relaxed mb-4">
                        {proj.desc}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.stack.map((tech, idx) => (
                          <span key={idx} className="text-[9px] font-semibold tracking-wider uppercase px-2 py-1 bg-zinc-900 border border-zinc-700/50 text-zinc-300 rounded select-none">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/50">
                      <div className="flex items-center gap-4 justify-center">
                        {proj.githubLink && (
                          <a 
                            href={proj.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-medium"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {proj.liveLink && (
                          <a 
                            href={proj.liveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-medium"
                          >
                            <ExternalLinkIcon className="w-3.5 h-3.5" />
                            <span>Live Link</span>
                          </a>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (proj.videoUrl) {
                            setSelectedProject(proj);
                          } else {
                            alert("Walkthrough coming soon!");
                          }
                        }}
                        className="flex items-center justify-center gap-2 text-white bg-white/10 hover:bg-white/20 transition-colors px-3 py-2 rounded-lg text-xs font-medium border border-white/10 w-full cursor-pointer"
                      >
                        <PlayIcon className="w-3.5 h-3.5" />
                        <span>Watch Walkthrough</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side Layout (col-span-5): master sticky glassmorphic stack panel */}
            <div className="lg:col-span-5 w-full lg:sticky lg:top-28 flex flex-col pointer-events-auto">

              {/* Glassmorphic skills matrix card */}
              <div className="w-full bg-[#0d0a16]/60 backdrop-blur-md border border-violet-500/10 p-8 py-8 h-auto lg:h-[540px] lg:max-h-[540px] rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />

                {/* Dynamic Contextual Skills Matrix Grid */}
                <div className="flex flex-wrap gap-2.5">
                {masterSkills.map((skill) => {
                  const isActiveSkill = projects[deckIndex]?.skills.includes(skill);
                  return (
                    <div
                      key={skill}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300 select-none ${
                        isActiveSkill
                          ? "text-purple-400 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] bg-purple-500/10 opacity-100 scale-105"
                          : "text-zinc-400/85 border-zinc-800/80 bg-transparent opacity-55 scale-100"
                      }`}
                    >
                      {skill}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section relative w-full min-h-[100vh] flex flex-col justify-center items-center z-10 bg-transparent py-24 px-8 md:px-24 overflow-hidden">
        
        {/* Sleek, Premium Ambient Contact Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[35%] left-[15%] w-[550px] h-[550px] rounded-full bg-purple-600/5 blur-[140px] transform-gpu" />
          <div className="absolute bottom-[15%] right-[15%] w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[120px] transform-gpu" />
        </div>

        {/* Section Header */}
        <div className="relative w-full text-center z-40 pointer-events-none mb-4">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[0.4em] text-zinc-300 uppercase drop-shadow-lg">
            GET IN TOUCH
          </h2>
        </div>

        {/* Sleek Two-Column Grid */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-16 mt-12 items-stretch">
          
          {/* Left Column: Quick Connect Channels */}
          <div className="w-full md:w-1/2 flex flex-col justify-between space-y-10">
            <div>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">Quick Connect</h3>
              <div className="mt-4 text-zinc-400 font-light leading-relaxed max-w-md space-y-4">
                <p>
                  Looking to discuss full-time Software Engineering roles, core developer opportunities, or schedule a technical interview? Let's connect immediately.
                </p>
                <p>
                  I am also open to discussing strategic business services, custom AI orchestrations, or potential collaborations for stealth ventures.
                </p>
              </div>
            </div>
            
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {/* Email Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#0d0a16] border border-violet-500/10 rounded-2xl gap-4 hover:border-violet-500/30 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600/10 rounded-xl text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email Address</h4>
                    <p className="text-sm font-medium text-white mt-1">roshansharma12001@gmail.com</p>
                  </div>
                </div>
                <a 
                  href="mailto:roshansharma12001@gmail.com" 
                  onClick={handleEmailClick}
                  className="sm:self-center text-xs font-semibold uppercase tracking-wider px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all text-center cursor-pointer"
                >
                  Send Email
                </a>
              </div>

              {/* Phone & WhatsApp Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#0d0a16] border border-violet-500/10 rounded-2xl gap-4 hover:border-violet-500/30 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600/10 rounded-xl text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Phone & WhatsApp</h4>
                    <p className="text-sm font-medium text-white mt-1">+91 7999784718</p>
                  </div>
                </div>
                <a href="https://wa.me/917999784718?text=Hi%20Roshan,%20I%20saw%20your%20portfolio%20and%20would%20love%20to%20connect!" target="_blank" rel="noopener noreferrer" className="sm:self-center text-xs font-semibold uppercase tracking-wider px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all text-center cursor-pointer">
                  Chat on WhatsApp
                </a>
              </div>

              {/* LinkedIn Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#0d0a16] border border-violet-500/10 rounded-2xl gap-4 hover:border-violet-500/30 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600/10 rounded-xl text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Professional Networks</h4>
                    <p className="text-sm font-medium text-white mt-1">LinkedIn Profile</p>
                  </div>
                </div>
                <a href="#" className="sm:self-center text-xs font-semibold uppercase tracking-wider px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all text-center cursor-pointer">
                  Connect
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Message Portal */}
          <div className="w-full md:w-1/2 flex">
            <form onSubmit={handleContactSubmit} className="flex-1 bg-[#0d0a16] border border-violet-500/20 p-8 rounded-3xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "16px 16px" }} />
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white tracking-tight">Message Portal</h3>
                <p className="text-zinc-500 text-xs mt-1">Status: Operational. Awaiting Supabase Configuration.</p>
              </div>

              <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center mb-6">
                <div>
                  <label htmlFor="form-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Name</label>
                  <input 
                    type="text" 
                    id="form-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#030014]/60 border border-violet-500/10 focus:border-purple-500 focus:outline-none rounded-xl text-white text-sm transition-all placeholder-zinc-600"
                    placeholder="Enter your full name" 
                  />
                </div>

                <div>
                  <label htmlFor="form-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="form-email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#030014]/60 border border-violet-500/10 focus:border-purple-500 focus:outline-none rounded-xl text-white text-sm transition-all placeholder-zinc-600"
                    placeholder="Enter your email address" 
                  />
                </div>

                <div>
                  <label htmlFor="form-message" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Your Message</label>
                  <textarea 
                    id="form-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-[#030014]/60 border border-violet-500/10 focus:border-purple-500 focus:outline-none rounded-xl text-white text-sm transition-all placeholder-zinc-600 resize-none flex-1 min-h-[100px]"
                    placeholder="Write your message here"
                  />
                </div>
              </div>

              <div className="relative z-10">
                <button 
                  type="submit" 
                  disabled={formStatus === "submitting"}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-xl text-sm font-semibold uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-[0.98] cursor-pointer"
                >
                  {formStatus === "submitting" ? "Syncing..." : formStatus === "success" ? "Message Dispatched!" : "Send Message"}
                </button>

                {formStatus === "success" && (
                  <p className="text-emerald-400 text-xs font-medium text-center mt-3 animate-pulse">
                    Success: Message synced cleanly to client dashboard.
                  </p>
                )}
              </div>
            </form>
          </div>

        </div>

        {/* Calendar Scheduler Block */}
        <div className="relative z-10 w-full max-w-6xl mx-auto mt-16">
          <CalendarWidget />
        </div>
      </section>

      {/* FUEL THE CODE SECTION */}
      <FuelTheCode />




      {/* The Walkthrough Blueprint Modal & Crash Guard */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 w-full h-full z-[100] flex flex-col items-center justify-center p-6 md:p-12 bg-black/70 backdrop-blur-2xl pointer-events-auto"
          >
            <button 
              onClick={handleCloseModal}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/20 p-4 rounded-full z-[110]"
            >
              <XIcon className="w-8 h-8" />
            </button>
            
            <div className="w-full max-w-[95vw] sm:max-w-[1200px] aspect-video bg-zinc-950/90 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative max-h-[85vh]">
              
              <div className="absolute top-0 left-0 w-full flex justify-between items-center p-6 bg-gradient-to-b from-zinc-950/80 to-transparent z-20 pointer-events-none">
                <h3 className="text-xs sm:text-2xl font-bold text-white tracking-widest uppercase drop-shadow-md">
                  {selectedProject.name} <span className="hidden sm:inline text-zinc-300 font-light">| WALKTHROUGH</span>
                </h3>
                <div className="flex gap-3 items-center pointer-events-auto">
                  <button 
                    onClick={handleFullscreen}
                    className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-medium tracking-widest flex items-center border border-white/20 transition-all"
                  >
                    [⛶ Fullscreen]
                  </button>
                </div>
              </div>

              <div ref={videoContainerRef} className="w-full h-full flex flex-col items-center justify-center bg-[#050505]">
                   {selectedProject.videoUrl ? (
                     <iframe
                       src={selectedProject.videoUrl}
                       title={`${selectedProject.name} Walkthrough`}
                       className="w-full h-full border-none rounded-2xl"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                       allowFullScreen
                     ></iframe>
                   ) : (
                     <>
                       <VideoIcon className="text-zinc-700 w-24 h-24 mb-6" />
                       <span className="text-zinc-500 font-light tracking-widest text-lg uppercase text-center max-w-lg px-4">
                         [ Loom Video Feed Container ]<br/>
                         <span className="text-xs text-zinc-700 mt-3 block font-mono">Status: Awaiting Feed Configuration</span>
                       </span>
                     </>
                   )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Asset Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden pointer-events-auto"
          >
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:24px_24px]" />
            <div className="absolute w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
            
            <div className="relative flex flex-col items-center space-y-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/10 border-t-purple-500 border-r-purple-400 animate-spin" />
                <div className="w-16 h-16 rounded-full bg-[#0d0a16] border border-white/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-white tracking-widest">{loadingProgress}%</span>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-sm font-semibold tracking-[0.25em] text-white uppercase mb-2">
                  Initializing Core Portfolio
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase min-h-[1.5em]">
                  {loadingProgress < 30 ? "Mapping neuro-matrices..." :
                   loadingProgress < 65 ? "Awakening AI models..." :
                   loadingProgress < 90 ? "Compiling spatial graphics..." : "Ready."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prominent Unmute Notification Overlay */}
      <AnimatePresence>
        {showUnmuteOverlay && (
          <motion.div
            key="unmute-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl overflow-hidden pointer-events-auto"
          >
            <div className="absolute w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative max-w-md w-full bg-[#0d0a16]/90 border border-purple-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)] text-center flex flex-col items-center space-y-6"
            >
              <div className="flex items-end justify-center space-x-1.5 h-10 w-full mb-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className="w-1 bg-purple-500 rounded-full animate-pulse"
                    style={{
                      height: `${[40, 90, 60, 80, 50, 70][idx]}%`,
                      animationDelay: `${idx * 150}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-white tracking-widest uppercase">
                  Voice Guide Representative
                </h2>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">
                  Roshan Sharma's portfolio includes an interactive vocal narration guide. Unmute to unlock full auditory and AI conversational features.
                </p>
              </div>

              <button
                onClick={handleStartExperience}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Unmute & Begin Experience
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bunny AI Chat Component */}
      <BunnyAIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
    </main>
  );
}

export default function Home() {
  return (
    <AudioProvider>
      <HomeContent />
    </AudioProvider>
  );
}
