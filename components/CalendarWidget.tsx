"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface AvailableDaysMap {
  [day: number]: TimeSlot[];
}

export default function CalendarWidget() {
  const { playAudio } = useAudio();
  const [selectedDay, setSelectedDay] = useState<number | null>(9); // Default selected date: June 9
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate availableDays where every single day from 1 to 30 of the current month (June 2026) is available by default
  const daysInMonth = 30; // June 2026
  const availableDays: AvailableDaysMap = {};
  for (let day = 1; day <= daysInMonth; day++) {
    availableDays[day] = [
      { time: "10:00 AM", available: true },
      { time: "1:30 PM", available: true },
      { time: "4:00 PM", available: true }
    ];
  }

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setSelectedTime(null);
    setBookingConfirmed(false);
    setErrorMessage(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setErrorMessage(null);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !selectedTime || !bookingName || !bookingEmail) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: bookingName,
          email: bookingEmail,
          selectedDate: selectedDay,
          selectedTime: selectedTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingConfirmed(true);
      } else {
        setErrorMessage(data.error || "Failed to schedule interview. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedTime(null);
    setBookingName("");
    setBookingEmail("");
    setBookingConfirmed(false);
    setErrorMessage(null);
  };

  // Generate calendar grid array
  const renderDays = () => {
    const dayCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDay === day;

      dayCells.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDaySelect(day)}
          className={`relative aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
            isSelected
              ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] scale-105 z-10 border border-purple-400/30 cursor-pointer"
              : "bg-purple-600/5 hover:bg-purple-600/20 text-white border border-purple-500/10 cursor-pointer"
          }`}
        >
          <span>{day}</span>
          
          {/* Pulsing emerald available indicator dot on every day */}
          <span 
            className={`absolute bottom-1.5 sm:bottom-2 w-1.5 h-1.5 rounded-full ${
              isSelected ? "bg-white" : "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            }`} 
          />
        </button>
      );
    }
    return dayCells;
  };

  if (!isExpanded) {
    return (
      <div className="w-full bg-[#0d0a16] border border-violet-500/20 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] transition-all duration-500 hover:border-violet-500/30">
        {/* Dynamic Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.01] pointer-events-none" 
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "16px 16px" }} 
        />
        
        {/* Neon purple top corner glow */}
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />

        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            playAudio("scheduler");
          }}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.55)] active:scale-[0.98] flex items-center gap-3 cursor-pointer group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-200 group-hover:scale-110 transition-transform"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Open Interview Scheduler
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-[#0d0a16] border border-violet-500/20 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden"
    >
      {/* Dynamic Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.01] pointer-events-none" 
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "16px 16px" }} 
      />
      
      {/* Neon purple top corner glow */}
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header with Close Toggle */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Interview Scheduler
          </h3>
          <p className="text-zinc-500 text-xs mt-1">Select an active green-dotted date and secure a slot immediately.</p>
        </div>
        
        {/* Collapse action */}
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="px-4 py-2 rounded-xl text-xxs font-semibold uppercase tracking-wider bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/10 cursor-pointer transition-colors"
        >
          Collapse Scheduler
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Portion: Month Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 px-2">
              <h4 className="text-lg font-bold text-white tracking-wide">June 2026</h4>
              <div className="flex gap-2">
                {/* Month Nav Placeholders */}
                <button type="button" disabled className="p-1.5 rounded-lg bg-zinc-800/40 text-zinc-600 border border-zinc-700/10 cursor-not-allowed opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button type="button" disabled className="p-1.5 rounded-lg bg-zinc-800/40 text-zinc-600 border border-zinc-700/10 cursor-not-allowed opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>

            {/* Weekdays Headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
              {weekdays.map((day) => (
                <div key={day} className="text-zinc-500 font-semibold text-[10px] sm:text-xs tracking-wider uppercase py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {renderDays()}
            </div>
          </div>

          {/* Status Indicator Legend */}
          <div className="flex gap-6 mt-6 px-2 text-xs font-medium text-zinc-500 border-t border-violet-500/5 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>Available Date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Right Portion: Time Slots & Booking Portal */}
        <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-violet-500/10 pt-8 lg:pt-0 lg:pl-8 min-h-[300px]">
          <div className="flex-1 flex flex-col">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Available Slots: {selectedDay ? `June ${selectedDay}, 2026` : "None"}
            </h4>

            {selectedDay && availableDays[selectedDay] ? (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Grid of Slots */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-6">
                    {availableDays[selectedDay].map((slot) => {
                      const isTimeSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`py-2.5 sm:py-3 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
                            isTimeSelected
                              ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] scale-[1.03] border border-purple-400/20 cursor-pointer"
                              : "bg-[#030014]/60 hover:bg-[#030014] text-zinc-300 border border-violet-500/5 hover:border-violet-500/30 cursor-pointer"
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>

                  {/* Micro-form once date + time are locked in */}
                  <AnimatePresence mode="wait">
                    {selectedTime && !bookingConfirmed && (
                      <motion.form
                        key="form-slot"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleConfirmBooking}
                        className="space-y-4 border-t border-violet-500/5 pt-5 overflow-hidden"
                      >
                        <div>
                          <label htmlFor="calendar-name" className="block text-xxs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Your Name</label>
                          <input
                            type="text"
                            id="calendar-name"
                            required
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-2.5 bg-[#030014]/60 border border-violet-500/10 focus:border-purple-500 focus:outline-none rounded-lg text-white text-xs transition-all placeholder-zinc-700"
                          />
                        </div>
                        <div>
                          <label htmlFor="calendar-email" className="block text-xxs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Email Address</label>
                          <input
                            type="email"
                            id="calendar-email"
                            required
                            value={bookingEmail}
                            onChange={(e) => setBookingEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full px-4 py-2.5 bg-[#030014]/60 border border-violet-500/10 focus:border-purple-500 focus:outline-none rounded-lg text-white text-xs transition-all placeholder-zinc-700"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer"
                        >
                          {isSubmitting ? "Locking in Slot..." : "Confirm Booking"}
                        </button>
                        {errorMessage && (
                          <p className="text-red-400 text-xxs font-medium mt-2 text-center animate-pulse">
                            Error: {errorMessage}
                          </p>
                        )}
                      </motion.form>
                    )}

                    {bookingConfirmed && (
                      <motion.div
                        key="confirmed-slot"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl text-center space-y-3"
                      >
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <div>
                          <h5 className="text-white text-sm font-bold">Interview Secured</h5>
                          <p className="text-zinc-400 text-xs mt-1">
                            Confirmed for <span className="text-purple-400 font-bold">June {selectedDay}</span> at <span className="text-purple-400 font-bold">{selectedTime}</span>
                          </p>
                          <p className="text-xxs text-zinc-500 mt-2 font-mono">
                            Confirmed as `{bookingName}` ({bookingEmail}). Syncing complete.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="mt-2 text-xxs font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Book Another Slot
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!selectedTime && (
                  <div className="flex-1 flex items-center justify-center border border-dashed border-violet-500/10 rounded-2xl p-6 bg-purple-950/5">
                    <p className="text-zinc-500 text-xs text-center leading-relaxed">
                      Select a time slot above to initialize booking details and secure this meeting.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border border-dashed border-violet-500/10 rounded-2xl p-6 bg-purple-950/5">
                <p className="text-zinc-500 text-xs text-center leading-relaxed">
                  Select an available date on the calendar to discover open times.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
