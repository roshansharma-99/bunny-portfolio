"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";

interface ProjectCardProps {
  title: string;
  image?: string | null;
  githubLink?: string | null;
  liveLink?: string | null;
  onClick: () => void;
}

export default function ProjectCard({ title, image, githubLink, liveLink, onClick }: ProjectCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative w-80 h-96 rounded-2xl flex-shrink-0 border border-white/20 bg-white/5 backdrop-blur-md flex flex-col items-center p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:bg-white/10 hover:border-purple-400/50 cursor-pointer group"
    >
      <div 
        style={{ transform: "translateZ(60px)" }} 
        className="w-full flex flex-col items-center h-full justify-between"
      >
        {/* Image Placeholder */}
        <div className="w-full h-40 rounded-xl bg-gradient-to-tr from-purple-900/40 to-fuchsia-900/40 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-purple-400/50 transition-colors relative">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 blur-[2px] group-hover:scale-110 transition-transform duration-500"></div>
          )}
        </div>

        <h3 className="text-xl font-medium tracking-widest text-white drop-shadow-md text-center mt-4">{title}</h3>
        
        {/* Icons */}
        <div className="flex gap-4 mt-auto">
          {githubLink && (
            <a 
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white" 
              title="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
          )}
          {liveLink && (
            <a 
              href={liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white" 
              title="Live Link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
