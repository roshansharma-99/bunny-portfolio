"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface BunnyAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BunnyAIChat({ isOpen, onClose }: BunnyAIChatProps) {
  const { isUnmuted, toggleMute } = useAudio();
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAwakening, setIsAwakening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isSelfStartingMicRef = useRef(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const handleSendMessageRef = useRef<(text: string) => void>(() => {});
  const hasSentSummaryRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const speechStartTimestampRef = useRef<number>(0);

  // Keep isAiSpeakingRef updated to prevent stale closures
  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  const isListeningRef = useRef(false);
  const micStateRef = useRef<'off' | 'starting' | 'listening' | 'stopping'>('off');

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const isOpenRef = useRef(false);
  const isVoiceModeRef = useRef(false);
  const isTypingRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Mandatory function that resolves the highest-fidelity English voice from available options
  const getBestVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const priorityKeywords = ["Google", "Natural", "Microsoft"];
    for (const kw of priorityKeywords) {
      const match = voices.find(
        (v) =>
          v.name.toLowerCase().includes(kw.toLowerCase()) &&
          v.lang.startsWith("en")
      );
      if (match) return match;
    }
    const enFallback = voices.find((v) => v.lang.startsWith("en"));
    return enFallback || voices[0] || null;
  };

  // Voice Loader Hook for premium browser voices (fixes Chrome & Edge async load issues)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    
    const loadVoices = () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        setVoicesLoaded(true);
      }
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Speech Recognition Initialization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    let silenceTimer: NodeJS.Timeout;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"; // Pure English continuity

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      micStateRef.current = "listening";
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      // Update interim transcript in real-time for UI display
      setInterimTranscript(transcript);

      // Clear the silence timer on every fresh word spoken
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }

      // Set a new timeout for exactly 1.5 seconds of silence
      silenceTimer = setTimeout(() => {
        if (transcript.trim()) {
          // Reset interim visual state
          setInterimTranscript("");
          // Automatically stop recording instantly using abort
          if (micStateRef.current === "starting" || micStateRef.current === "listening") {
            try {
              micStateRef.current = "stopping";
              recognition.abort();
            } catch (abortErr) {}
          }
          // Dispatch captured transcript to the backend
          handleSendMessageRef.current(transcript.trim());
        }
      }, 1500);
    };

    recognition.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;
      micStateRef.current = "off";
      setInterimTranscript("");
    };

    recognition.onerror = (e: any) => {
      if (e.error === "not-allowed") {
        console.warn("Microphone permission denied. Disabling voice mode.");
        setIsVoiceMode(false);
        isVoiceModeRef.current = false;
        return;
      }
      // Ignore silent 'no-speech' network errors or 'aborted' without crashing component state
      if (e.error === "no-speech" || e.error === "aborted" || e.error === "network") {
        console.log(`Speech recognition silent warning: ${e.error}`);
        return;
      }
      console.error("Speech recognition error:", e);
      setIsListening(false);
      isListeningRef.current = false;
      micStateRef.current = "off";
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (micStateRef.current === "starting" || micStateRef.current === "listening") {
        try {
          micStateRef.current = "stopping";
          recognition.abort();
        } catch (err) {}
      }
    };
  }, []);

  // Manage Speech Recognition lifecycle: abort if panel is closed, voice mode is off, AI is speaking, or typing
  useEffect(() => {
    if (!recognitionRef.current) return;

    const rec = recognitionRef.current;

    if (!isOpen || !isVoiceMode || isAiSpeaking || isTyping) {
      if (micStateRef.current === "starting" || micStateRef.current === "listening") {
        try {
          micStateRef.current = "stopping";
          rec.abort();
        } catch (e) {
          // Safe catch
        }
      }
    }
  }, [isOpen, isVoiceMode, isAiSpeaking, isTyping]);

  // Helper function to speak text out loud safely
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      console.warn("Speech synthesis not supported or ready.");
      return;
    }

    // Block from executing audio unless voice assistance mode is active
    if (!isVoiceModeRef.current) {
      console.warn("Vocal output blocked because voice assistance mode is inactive.");
      return;
    }

    // Decouple engines completely: abort recognition immediately before any speech output
    if (recognitionRef.current) {
      if (micStateRef.current === "starting" || micStateRef.current === "listening") {
        try {
          micStateRef.current = "stopping";
          recognitionRef.current.abort();
        } catch (abortErr) {}
      }
    }

    // Cancel any ongoing speech safely
    try {
      window.speechSynthesis.cancel();
    } catch (cancelErr) {
      console.warn("speechSynthesis.cancel failed:", cancelErr);
    }

    // Set state synchronously to prevent microphone race condition
    setIsAiSpeaking(true);
    speechStartTimestampRef.current = Date.now();

    // Clean up text from emojis and standard markdown for TTS reading
    const cleanText = text
      .replace(/🎙️|🌟|⚡|🛠️|📅|⚠️/g, "")
      .replace(/[\*\#\_]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US"; // Enforce English globally

    utterance.pitch = 1.05; // Cadence pitch parameter (normalised, non-monotone)
    utterance.rate = 1.05;  // Cadence rate parameter (normalised)
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      // ONLY trigger recognition.start() in the utterance.onend callback to ensure turn-taking is flawless
      if (isOpenRef.current && isVoiceModeRef.current && !isTypingRef.current) {
        if (recognitionRef.current && micStateRef.current === "off") {
          try {
            micStateRef.current = "starting";
            recognitionRef.current.start();
          } catch (e) {
            micStateRef.current = "off";
          }
        }
      }
    };

    utterance.onerror = (e) => {
      if (e.error === "interrupted" || e.error === "canceled") {
        console.log(`SpeechSynthesis silent warning: ${e.error}`);
        setIsAiSpeaking(false);
        return;
      }
      console.error("SpeechSynthesis error:", e);
      setIsAiSpeaking(false);
      // Restart on error to prevent lockout
      if (isOpenRef.current && isVoiceModeRef.current && !isTypingRef.current) {
        if (recognitionRef.current && micStateRef.current === "off") {
          try {
            micStateRef.current = "starting";
            recognitionRef.current.start();
          } catch (err) {
            micStateRef.current = "off";
          }
        }
      }
    };

    // Assign premium voice matching Google, Natural or Microsoft
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch (speechError) {
      console.error("speechSynthesis.speak error:", speechError);
      setIsAiSpeaking(false);
    }
  };

  // Handle toggling Voice Assistance mode with explicit mic permission request
  const handleVoiceToggle = async () => {
    const nextMode = !isVoiceMode;
    setIsVoiceMode(nextMode);
    isVoiceModeRef.current = nextMode; // Sync synchronously to allow immediate greeting audio

    if (nextMode) {
      // Request mic permission to trigger browser popup prompt
      if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
        } catch (micError) {
          console.warn("Microphone access request denied or failed:", micError);
        }
      }

      const greeting = "Hey! How are you? I'm Roshan's Voice AI Agent. He is an exceptional Full-Stack Developer and AI Product Builder specialized in React and autonomous agent frameworks. May I know a bit about you and what role you're looking to fill today?";
      setMessages([
        {
          sender: "bot",
          text: `🎙️ ${greeting}`,
          timestamp: new Date(),
        },
      ]);
      speakText(greeting);
    } else {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      setIsAiSpeaking(false);
      setMessages([
        {
          sender: "bot",
          text: "Hello! I am Bunny, Roshan's autonomous AI assistant. 🌟 Ask me about his projects, skills, or get a quick 60s pitch on his full-stack & AI engineering capabilities!",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const messagesRef = useRef<Message[]>([]);

  // Keep messagesRef updated to prevent closure staleness on unmount
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Function to send chat summary via API
  const sendChatSummary = async (msgsToSend: Message[]) => {
    if (!msgsToSend || msgsToSend.length <= 1) return;
    if (hasSentSummaryRef.current) return;
    hasSentSummaryRef.current = true;
    try {
      await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: msgsToSend.map((m) => ({
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp.toISOString(),
          })),
        }),
        keepalive: true, // Allow request to complete after tab close / navigate away
      });
    } catch (err) {
      console.error("Error sending post-chat summary email:", err);
    }
  };

  // Stop speaking and trigger summary email on navigate away/unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      const finalMsgs = messagesRef.current;
      if (finalMsgs.length > 1) {
        sendChatSummary(finalMsgs);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      setIsAiSpeaking(false);
      
      // Trigger summary email when the drawer is closed using the safe messages ref
      const finalMsgs = messagesRef.current;
      if (finalMsgs.length > 1) {
        sendChatSummary(finalMsgs);
      }
    }
  }, [isOpen]);

  // Trigger temporary intense neon awakening pulse on open
  useEffect(() => {
    if (isOpen) {
      setIsAwakening(true);
      const timer = setTimeout(() => {
        setIsAwakening(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsFullScreen(false);
    }
  }, [isOpen]);

  // Seed initial bot messages
  useEffect(() => {
    if (isOpen) {
      hasSentSummaryRef.current = false; // Reset the summary flag for the new session
      if (isVoiceMode) {
        isVoiceModeRef.current = true; // Sync ref synchronously to allow immediate greeting audio
        const greeting = "Hey! How are you? I'm Roshan's Voice AI Agent. He is an exceptional Full-Stack Developer and AI Product Builder specialized in React and autonomous agent frameworks. May I know a bit about you and what role you're looking to fill today?";
        setMessages([
          {
            sender: "bot",
            text: `🎙️ ${greeting}`,
            timestamp: new Date(),
          },
        ]);
        speakText(greeting);
      } else {
        setMessages([
          {
            sender: "bot",
            text: "Hello! I am Bunny, Roshan's autonomous AI assistant. 🌟 Ask me about his projects, skills, or get a quick 60s pitch on his full-stack & AI engineering capabilities!",
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [isOpen]);

  // Scroll to bottom when message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          isVoiceMode: isVoiceMode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to receive response from Bunny AI.");
      }

      const responseText = await response.text();

      // Push the response from the backend directly as a single message bubble
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: responseText,
          timestamp: new Date(),
        },
      ]);

      if (isVoiceMode) {
        speakText(responseText);
      }
    } catch (error) {
      console.error("Error sending message to Bunny AI:", error);
      const errText = "Connection error. Bunny's neuro-link was interrupted. Please check your network or try again.";
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ ${errText}`,
          timestamp: new Date(),
        },
      ]);

      // Complete Audio Reset Hooks on Client Failure
      if (typeof window !== "undefined" && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (audioErr) {
          console.warn("speechSynthesis.cancel failed:", audioErr);
        }
      }
      setIsAiSpeaking(false);

      if (isVoiceMode) {
        speakText(errText);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Keep handleSendMessageRef updated
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer"
          />

          {/* Sliding Right Drawer */}
          <motion.div
            layout
            initial={isFullScreen ? { scale: 0.9, opacity: 0 } : { x: "100%" }}
            animate={isFullScreen ? { scale: 1, opacity: 1, x: 0 } : { x: 0 }}
            exit={isFullScreen ? { scale: 0.9, opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className={`fixed top-0 right-0 h-full w-full bg-zinc-950/90 backdrop-blur-xl border-l z-50 flex flex-col pointer-events-auto transition-all duration-500 ${
              isFullScreen ? "inset-0 max-w-full" : "max-w-md"
            } ${
              isAwakening
                ? "animate-pulse shadow-[0_0_50px_rgba(168,85,247,0.6)] border-purple-400"
                : "border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.25)]"
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-[#0d0a16]/40">
              <div className="flex items-center space-x-3">
                {/* pulsing green dot status */}
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase">Bunny AI Chat</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">AGENT_READY</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Voice Mode Toggle Switch */}
                <button
                  onClick={handleVoiceToggle}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isVoiceMode
                      ? "bg-purple-600/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                  title="Toggle Voice Call Mode"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                  <span>Voice Assistance</span>
                </button>

                {/* Mirrored Global Mute Toggle Button */}
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                    isUnmuted 
                      ? "bg-purple-600/20 border-purple-500/30 text-purple-300 hover:text-white" 
                      : "bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300"
                  }`}
                  title={isUnmuted ? "Mute Guide Narration" : "Unmute Guide Narration"}
                >
                  {isUnmuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                  )}
                </button>

                {/* Full Screen Expand Button */}
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 rounded-lg transition-colors cursor-pointer"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:scale-110 transition-transform text-purple-400 hover:text-cyan-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                      <polyline points="4 14 10 14 10 20"/>
                      <polyline points="20 10 14 10 14 4"/>
                      <line x1="10" x2="3" y1="14" y2="21"/>
                      <line x1="14" x2="21" y1="10" y2="3"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:scale-110 transition-transform text-purple-400 hover:text-cyan-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                      <polyline points="15 3 21 3 21 9"/>
                      <polyline points="9 21 3 21 3 15"/>
                      <line x1="21" x2="14" y1="3" y2="10"/>
                      <line x1="3" x2="10" y1="21" y2="14"/>
                    </svg>
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" x2="6" y1="6" y2="18"/>
                    <line x1="6" x2="18" y1="6" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 relative flex flex-col">
              {!isVoiceMode ? (
                // Text Mode Layout
                <>
                  {/* Inline static secure session warning */}
                  <div className="bg-[#0f0b1e]/60 border border-purple-500/20 px-4 py-3.5 rounded-2xl text-[11px] text-purple-300 leading-relaxed font-sans mb-4 shadow-[0_4px_15px_rgba(168,85,247,0.05)] select-none">
                    🔒 Secure Session: A copy of this chat transcript will be forwarded directly to Roshan's mailbox. Please feel free to share your name, company, and email here so he can get in touch with you directly!
                  </div>
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-purple-600 text-white rounded-tr-none shadow-[0_4px_15px_rgba(139,92,246,0.2)]"
                            : "bg-zinc-900/90 text-zinc-200 border border-zinc-800/80 rounded-tl-none"
                        }`}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-zinc-600 mt-1 select-none font-mono">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center space-x-2 bg-zinc-900/60 border border-zinc-800/50 p-4 rounded-2xl rounded-tl-none self-start max-w-[85%]">
                      <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              ) : (
                // Voice Mode Audio Visualizer Effect
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 select-none">
                  {/* Neon pulsing orb container */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
                    <motion.div
                      animate={isAiSpeaking ? { scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] } : { scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
                      transition={{ repeat: Infinity, duration: isAiSpeaking ? 1 : 3, ease: "easeInOut" }}
                      className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600/20 to-cyan-500/20 backdrop-blur-md border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] flex items-center justify-center relative overflow-hidden"
                    >
                      {isAiSpeaking && (
                        <svg className="absolute inset-x-0 bottom-4 w-full h-12 pointer-events-none" viewBox="0 0 128 48" fill="none">
                          <motion.path
                            d="M 10,24 L 40,24 L 46,12 L 52,36 L 58,4 L 64,44 L 70,24 L 82,24 L 88,14 L 94,34 L 100,24 L 118,24"
                            stroke="#22d3ee"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0, pathOffset: 0 }}
                            animate={{ 
                              pathLength: [0.2, 0.5, 0.2], 
                              pathOffset: [0, 0.5, 1],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.2,
                              ease: "linear",
                            }}
                            style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }}
                          />
                        </svg>
                      )}
                    </motion.div>
                  </div>

                  {/* Pulsing sound wave graphics */}
                  <div className="flex items-end justify-center space-x-1.5 h-16 w-full max-w-[200px]">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => {
                      return (
                        <motion.div
                          key={idx}
                          animate={isAiSpeaking ? { height: ["10%", "95%", "10%"] } : { height: ["10%", "18%", "10%"] }}
                          transition={{
                            repeat: Infinity,
                            duration: isAiSpeaking ? 0.4 + (idx % 3) * 0.15 : 1.5,
                            ease: "easeInOut"
                          }}
                          className="w-1.5 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                          style={{ minHeight: "10%" }}
                        />
                      );
                    })}
                  </div>

                  {/* Real-time speech transcription typing indicator */}
                  {interimTranscript && (
                    <div className="flex items-center space-x-3 bg-zinc-900/80 border border-purple-500/30 p-4 rounded-2xl max-w-[85%] shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md">
                      <div className="flex space-x-1 shrink-0">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <p className="text-xs text-purple-300 break-words font-medium">
                        🎤 &ldquo;{interimTranscript}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="text-center space-y-2">
                    <p className="text-sm font-semibold text-purple-300 tracking-wider uppercase animate-pulse">
                      {isAiSpeaking ? "Bunny Speaking..." : "Bunny AI Listening..."}
                    </p>
                    <p className="text-xs text-zinc-500 max-w-[280px]">
                      {isAiSpeaking ? "Roshan's Voice AI Agent is presenting his skills." : "Ask Roshan's AI rep about his experience, workflows, or open-source stack."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Pills & Custom Input Form */}
            {!isVoiceMode && (
              <div className="p-6 border-t border-zinc-800/80 bg-[#0d0a16]/20 shrink-0 space-y-4">
                {/* 3 Clickable Prompt Pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePromptClick("⚡ Get 60s Pitch")}
                    className="text-[10px] font-semibold tracking-wider uppercase px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-purple-950/10 text-zinc-300 hover:text-purple-300 rounded-lg transition-all cursor-pointer"
                  >
                    ⚡ Get 60s Pitch
                  </button>
                  <button
                    onClick={() => handlePromptClick("🛠️ Check Gen-AI Projects")}
                    className="text-[10px] font-semibold tracking-wider uppercase px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-purple-950/10 text-zinc-300 hover:text-purple-300 rounded-lg transition-all cursor-pointer"
                  >
                    🛠️ Check Gen-AI Projects
                  </button>
                  <button
                    onClick={() => handlePromptClick("📅 Schedule Interview")}
                    className="text-[10px] font-semibold tracking-wider uppercase px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-purple-950/10 text-zinc-300 hover:text-purple-300 rounded-lg transition-all cursor-pointer"
                  >
                    📅 Schedule Interview
                  </button>
                </div>

                {/* Input Text Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }}
                  className="flex items-center space-x-3 bg-zinc-900/60 border border-zinc-800/80 p-1.5 rounded-xl focus-within:border-purple-500/50 transition-colors"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask Bunny about Roshan..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500 hover:text-black shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-200 rounded-lg p-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
