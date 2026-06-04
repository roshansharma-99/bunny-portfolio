"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = cursorDot.current;
    const ring = cursorRing.current;
    if (!dot || !ring) return;

    // Center initially
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });

    const setDotX = gsap.quickSetter(dot, "x", "px");
    const setDotY = gsap.quickSetter(dot, "y", "px");
    
    // Smooth trailing ring
    const xTo = gsap.quickTo(ring, "x", { duration: 0.15, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.15, ease: "power3.out" });

    const onMouseMove = (e: MouseEvent) => {
      setDotX(e.clientX);
      setDotY(e.clientY);
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);

    const onMouseEnterMagnetic = () => {
      gsap.to(ring, { scale: 3, duration: 0.3, ease: "power2.out" });
    };
    
    const onMouseLeaveMagnetic = () => {
      gsap.to(ring, { scale: 1, duration: 0.3, ease: "power2.out" });
    };

    // Add magnetic hover listeners
    const addListeners = () => {
      const magneticElements = document.querySelectorAll("[data-magnetic]");
      magneticElements.forEach((el) => {
        el.addEventListener("mouseenter", onMouseEnterMagnetic);
        el.addEventListener("mouseleave", onMouseLeaveMagnetic);
      });
    };

    // Simple observer to attach listeners to dynamic elements
    const observer = new MutationObserver(() => {
      addListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    addListeners();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference overflow-hidden">
      <div ref={cursorDot} className="absolute left-0 top-0 w-1 h-1 bg-white rounded-full will-change-transform" />
      <div ref={cursorRing} className="absolute left-0 top-0 w-[30px] h-[30px] border border-white rounded-full will-change-transform" />
    </div>
  );
}
