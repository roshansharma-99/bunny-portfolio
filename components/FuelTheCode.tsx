"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

interface Tier {
  id: string;
  emoji: string;
  name: string;
  amount: number;
  description: string;
  popular?: boolean;
}

export default function FuelTheCode() {
  const { playAudio } = useAudio();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [copied, setCopied] = useState(false);
  const [pcAlert, setPcAlert] = useState(false);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "7999784718@ybl";
  const payeeName = process.env.NEXT_PUBLIC_PAYEE_NAME || "Roshan Sharma";

  const tiers: Tier[] = [
    {
      id: "coffee",
      emoji: "☕",
      name: "Buy a Coffee",
      amount: 100,
      description: "Support my late-night development sprints and keep the brains fully caffeinated."
    },
    {
      id: "ai",
      emoji: "🤖",
      name: "Fuel an AI Agent",
      amount: 300,
      description: "Fund API tokens and computing power to keep autonomous background agents active.",
      popular: true
    },
    {
      id: "infra",
      emoji: "⚡",
      name: "Sponsor Infrastructure",
      amount: 500,
      description: "Help offset high-performance server hosting, database storage, and CDN uptime costs."
    }
  ];

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getUpiDeepLink = (amount: number) => {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=FuelTheCode&cu=INR`;
  };

  const isMobileDevice = () => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleUpiDeepLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isMobileDevice()) {
      e.preventDefault();
      setPcAlert(true);
      setTimeout(() => setPcAlert(false), 6000);
    }
  };

  const handleCancelCheckout = () => {
    setSelectedTier(null);
    setPcAlert(false);
    setIsQrZoomed(false);
  };

  return (
    <section 
      className="relative overflow-hidden w-full py-20 bg-[#0f0926] px-8 md:px-24 border-t border-violet-500/10 fuel-section"
      style={{ backgroundImage: 'url("/backgroundss.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Crisp High-tech Grid overlay with radial center fade */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-3">
            ☕ Fuel the Code
          </h2>
          <p className="text-zinc-400 font-light leading-relaxed max-w-2xl mx-auto mt-4 text-sm md:text-base">
            Support my development sprints, server uptime, and open-source contributions. 
            100% of community fuel goes straight into infrastructure costs.
          </p>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <motion.div
              key={tier.id}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => {
                setSelectedTier(tier);
                playAudio("payment");
              }}
              className="bg-neutral-950/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 relative z-10 transition-all duration-300 hover:border-purple-500/40 shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer group"
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute top-4 right-4 bg-purple-600/80 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-purple-400/20">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div className="text-4xl">{tier.emoji}</div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-purple-300 transition-colors">
                    {tier.name}
                  </h3>
                  <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">{tier.description}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-violet-500/5 flex items-center justify-between">
                <div>
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Support</span>
                  <span className="text-2xl font-black text-white">₹{tier.amount}</span>
                </div>
                
                <span className="px-4 py-2 bg-purple-600/10 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider text-purple-400 transition-all duration-300">
                  Fuel Tier
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Checkout Modal Overlay */}
      <AnimatePresence>
        {selectedTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            {/* Modal Card Wrapper */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-[#070514]/95 backdrop-blur-md border border-purple-500/40 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.25)] max-w-md w-full max-h-[90vh] overflow-y-auto relative overflow-hidden flex flex-col items-center justify-between"
            >
              {/* Dynamic Background Grid Pattern */}
              <div 
                className="absolute inset-0 opacity-[0.01] pointer-events-none" 
                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "16px 16px" }} 
              />
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />

              <div className="w-full text-center relative z-10 space-y-4">
                {/* Modal Header */}
                <div>
                  <span className="text-3xl block mb-2">{selectedTier.emoji}</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">Fueling: {selectedTier.name}</h3>
                  <p className="text-purple-400 font-extrabold text-2xl mt-1">₹{selectedTier.amount}</p>
                  <p className="text-zinc-500 text-xxs max-w-xs mx-auto mt-2 leading-relaxed">
                    Complete your checkout natively using any UPI application or scan the secure fallback code.
                  </p>
                </div>

                {/* Checkout Action Channels */}
                <div className="space-y-4 py-4">
                  {/* Mobile Deep Link CTA Button */}
                  <a
                    href={getUpiDeepLink(selectedTier.amount)}
                    onClick={(e) => {
                      handleUpiDeepLinkClick(e);
                      playAudio("payment");
                    }}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] active:scale-[0.98] flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-200"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Pay via UPI App Natively
                    </span>
                  </a>

                  {/* Device-aware PC alert message */}
                  <AnimatePresence>
                    {pcAlert && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-amber-400 text-[10px] font-medium leading-relaxed max-w-xs mx-auto mt-2 text-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/20"
                      >
                        💻 On a PC? Please scan the QR code below using your mobile payment app to complete the checkout!
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Desktop Fallback Separator */}
                  <div className="flex items-center justify-center gap-3 py-1">
                    <span className="h-px bg-violet-500/10 flex-1" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Desktop Fallback QR</span>
                    <span className="h-px bg-violet-500/10 flex-1" />
                  </div>

                  {/* QR Image Container with clickable expansion lightbox */}
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider block hover:text-purple-400 transition-colors cursor-pointer" onClick={() => setIsQrZoomed(true)}>
                      🔍 Click to expand QR code
                    </span>

                    <div 
                      onClick={() => setIsQrZoomed(true)}
                      className="bg-[#030014] p-3.5 border border-purple-500/20 rounded-2xl relative shadow-inner overflow-hidden max-w-[200px] cursor-pointer hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-300 group"
                    >
                      <img 
                        src="/upiphone.jpg" 
                        alt="UPI Payment QR Code" 
                        className="w-full aspect-square object-contain rounded-xl opacity-90 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>

                    {/* Click-to-copy UPI Address Badge */}
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="px-4 py-2.5 bg-[#030014]/60 border border-violet-500/10 hover:border-purple-500/30 rounded-xl text-xxs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      {copied ? "Copied ID!" : upiId}
                    </button>
                  </div>
                </div>

                {/* Cancel Checkout Close Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCancelCheckout}
                    className="w-full py-3 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xxs font-bold uppercase tracking-widest border border-zinc-700/10 hover:border-zinc-700/30 transition-all cursor-pointer"
                  >
                    Cancel Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded QR Lightbox Overlay */}
      <AnimatePresence>
        {isQrZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQrZoomed(false)}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#070514] p-5 sm:p-6 border border-purple-500/40 rounded-3xl max-w-md w-full relative overflow-hidden flex flex-col items-center justify-center"
            >
              <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Scan QR Code</h4>
              <div className="bg-[#030014] p-2 border border-purple-500/20 rounded-2xl w-full">
                <img
                  src="/upiphone.jpg"
                  alt="UPI Payment QR Code Zoomed"
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
              <p className="text-zinc-400 text-xxs mt-4 text-center max-w-[285px] leading-relaxed">
                Scan using PhonePe, GPay, Paytm, or any UPI banking app to secure support.
              </p>
              <button
                type="button"
                onClick={() => setIsQrZoomed(false)}
                className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xxs font-bold uppercase tracking-widest transition-colors cursor-pointer shadow-lg"
              >
                Close Zoom
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
