"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const AUDIO_FILES = {
  intro: "/audio/Intro-greet01.mp3",
  intro2: "/audio/roshan-project 02.mp3",
  projects: "/audio/project-03.mp3",
  projectsEnd: "/audio/project-end-4.mp3",
  contact: "/audio/contact-email-05.mp3",
  scheduler: "/audio/interview-scheduled-06.mp3",
  fuel: "/audio/payment-gate-08.mp3",
  payment: "/audio/payment-2gate-09.mp3",
  chat: "/audio/10-bunny-ai-chat.mp3",
  easterEgg: "/audio/fahhhhhhhhhhhhhhh.mp3",
} as const;

type AudioKey = keyof typeof AUDIO_FILES;

interface AudioContextType {
  isUnmuted: boolean;
  isPlaying: boolean;
  currentPlaying: AudioKey | null;
  playAudio: (key: AudioKey) => void;
  stopAudio: () => void;
  unmuteAndStart: () => void;
  playedKeys: Set<AudioKey>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isUnmuted, setIsUnmuted] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState<AudioKey | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playedKeys, setPlayedKeys] = useState<Set<AudioKey>>(new Set());
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    setIsPlaying(currentPlaying !== null);
  }, [currentPlaying]);
  
  // Keep refs updated for event listeners to avoid closure capture issues
  const isUnmutedRef = useRef(isUnmuted);
  const playedKeysRef = useRef(playedKeys);
  
  useEffect(() => {
    isUnmutedRef.current = isUnmuted;
  }, [isUnmuted]);
  
  useEffect(() => {
    playedKeysRef.current = playedKeys;
  }, [playedKeys]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

  const stopAudio = () => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (err) {
        // Safe check
      }
      activeAudioRef.current = null;
      setCurrentPlaying(null);
    }
  };

  const playAudio = (key: AudioKey) => {
    // Audio restriction rule
    if (!isUnmutedRef.current && key !== "intro") {
      console.log(`[Audio Engine]: Playback of "${key}" blocked because guide is muted.`);
      return;
    }

    // Play once per session constraint
    if (playedKeysRef.current.has(key)) {
      console.log(`[Audio Engine]: "${key}" already played in this session. Skipping.`);
      return;
    }

    // Stop current audio instantly
    stopAudio();

    const src = AUDIO_FILES[key];
    const audio = new Audio(src);
    activeAudioRef.current = audio;
    setCurrentPlaying(key);

    setPlayedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    audio.addEventListener("ended", () => {
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null;
        setCurrentPlaying(null);
      }
      console.log(`[Audio Engine]: Finished playing key "${key}"`);
      if (key === "intro") {
        console.log(`[Audio Engine]: Auto-sequencing key "intro2"`);
        playAudio("intro2");
      }
    });

    audio.addEventListener("error", (e) => {
      console.warn(`[Audio Engine Warning]: Missing or failed to load audio file for key "${key}" at "${src}"`, e);
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null;
        setCurrentPlaying(null);
      }
    });

    audio.play().catch((err) => {
      console.warn(`[Audio Engine Warning]: Playback failed for key "${key}". Browser policies may require user interaction first.`, err);
    });
  };

  const unmuteAndStart = () => {
    setIsUnmuted(true);
    isUnmutedRef.current = true;
    playAudio("intro");
  };

  return (
    <AudioContext.Provider
      value={{
        isUnmuted,
        isPlaying,
        currentPlaying,
        playAudio,
        stopAudio,
        unmuteAndStart,
        playedKeys,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
