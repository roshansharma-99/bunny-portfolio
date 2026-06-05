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
  currentAudio: string | null;
  progress: number;
  playAudio: (key: AudioKey) => void;
  stopAudio: () => void;
  unmuteAndStart: () => void;
  toggleMute: () => void;
  playedKeys: Set<AudioKey>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isUnmuted, setIsUnmuted] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState<AudioKey | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playedKeys, setPlayedKeys] = useState<Set<AudioKey>>(new Set());
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentAudio = currentPlaying ? AUDIO_FILES[currentPlaying] : null;

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
    setProgress(0);
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
    setProgress(0);

    // Sync muted state
    audio.muted = !isUnmutedRef.current;

    setPlayedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    let lastProgress = 0;
    audio.addEventListener("timeupdate", () => {
      if (activeAudioRef.current === audio) {
        const dur = audio.duration;
        const cur = audio.currentTime;
        if (dur && !isNaN(dur)) {
          const nextProgress = (cur / dur) * 100;
          if (Math.abs(nextProgress - lastProgress) >= 0.5 || nextProgress === 0 || nextProgress >= 100) {
            setProgress(nextProgress);
            lastProgress = nextProgress;
          }
        } else {
          setProgress(0);
        }
      }
    });

    audio.addEventListener("ended", () => {
      if (activeAudioRef.current === audio) {
        activeAudioRef.current = null;
        setCurrentPlaying(null);
        setProgress(0);
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
        setProgress(0);
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

  const toggleMute = () => {
    setIsUnmuted((prev) => {
      const next = !prev;
      isUnmutedRef.current = next;
      if (activeAudioRef.current) {
        activeAudioRef.current.muted = !next;
      }
      return next;
    });
  };

  return (
    <AudioContext.Provider
      value={{
        isUnmuted,
        isPlaying,
        currentPlaying,
        currentAudio,
        progress,
        playAudio,
        stopAudio,
        unmuteAndStart,
        toggleMute,
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
