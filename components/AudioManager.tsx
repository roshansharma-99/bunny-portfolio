"use client";

import { useEffect, useRef } from "react";

interface AudioManagerProps {
  isStarted: boolean;
  scrollPos: number;
  interactSignal: number;
}

export default function AudioManager({ isStarted, scrollPos, interactSignal }: AudioManagerProps) {
  const introPlayed = useRef(false);
  const prevSection = useRef(0);
  const prevInteract = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const safePlay = (src: string, eventName: string) => {
    const audio = new Audio(src);
    audio.play().catch(() => {
      console.log(`Voice: ${eventName}`);
    });
  };

  // 1. GREETING (Plays on Unmute)
  useEffect(() => {
    if (isStarted && !introPlayed.current) {
      safePlay("/audio/intro.mp3", "GREETING (Plays on Unmute)");
      introPlayed.current = true;
    }
  }, [isStarted]);

  // 2. SECTION_CHANGE (Plays when the user scrolls into a new section)
  useEffect(() => {
    if (!isStarted) return;
    
    // 5 sections total. Scroll goes 0 to 1.
    // Ranges: 0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0
    const currentSection = Math.floor(scrollPos * 4.99);
    
    if (currentSection !== prevSection.current) {
      if (currentSection === 1) {
        console.log("Voice: Let me show you what I have built.");
      } else {
        safePlay("/audio/section.mp3", "SECTION_CHANGE (Plays when the user scrolls into a new section)");
      }
      prevSection.current = currentSection;
    }
  }, [scrollPos, isStarted]);

  // 3. INTERACT (Plays if the user clicks the bunny)
  useEffect(() => {
    if (isStarted && interactSignal > prevInteract.current) {
      safePlay("/audio/interact.mp3", "INTERACT (Plays if the user clicks the bunny)");
      prevInteract.current = interactSignal;
    }
  }, [interactSignal, isStarted]);

  // 4. IDLE (Plays if no movement for 10 seconds)
  useEffect(() => {
    if (!isStarted) return;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      safePlay("/audio/idle.mp3", "IDLE (Plays if no movement for 10 seconds)");
    }, 10000);

    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [scrollPos, isStarted, interactSignal]); // Reset idle timer on scroll or interact

  return null;
}
