"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function MagneticButton({ children, className, ...props }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const btn = buttonRef.current;
    const text = textRef.current;
    if (!btn || !text) return;

    const onMouseMove = (e: MouseEvent) => {
      if (typeof window !== "undefined" && window.innerWidth < 1024) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // 40px radius threshold around the button bounding box
      const isNearX = e.clientX >= rect.left - 40 && e.clientX <= rect.right + 40;
      const isNearY = e.clientY >= rect.top - 40 && e.clientY <= rect.bottom + 40;

      if (isNearX && isNearY) {
        // pull button and text
        const maxPull = 15;
        const pullX = Math.max(-maxPull, Math.min(maxPull, deltaX * 0.3));
        const pullY = Math.max(-maxPull, Math.min(maxPull, deltaY * 0.3));
        
        gsap.to(btn, {
          x: pullX,
          y: pullY,
          duration: 0.3,
          ease: "power2.out"
        });
        gsap.to(text, {
          x: pullX * 0.5,
          y: pullY * 0.5,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        // Snap back if mouse leaves range but still triggers move
        gsap.to([btn, text], {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1.2, 0.3)"
        });
      }
    };

    const onMouseLeave = () => {
      gsap.to([btn, text], {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1.2, 0.3)"
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    btn.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      btn.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <button ref={buttonRef} data-magnetic className={className} {...props}>
      <span ref={textRef} className="pointer-events-none block will-change-transform">
        {children}
      </span>
    </button>
  );
}
