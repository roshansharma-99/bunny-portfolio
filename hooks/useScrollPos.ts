"use client";

import { useState, useEffect } from "react";

export function useScrollPos() {
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight === 0) {
        setScrollPos(0);
        return;
      }
      
      const scroll = totalScroll / windowHeight;
      // Clamp between 0 and 1
      setScrollPos(Math.min(1, Math.max(0, scroll)));
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Init
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollPos;
}
