import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Beep using Web Audio API
function playBeep(freq = 880, duration = 0.12, type = 'sine') {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

const STEPS = [
  { label: '3', color: 'text-red-500', freq: 660 },
  { label: '2', color: 'text-orange-400', freq: 770 },
  { label: '1', color: 'text-yellow-400', freq: 880 },
  { label: 'Let it Rip!!', color: 'text-primary', freq: 1100 },
];

// onDone is called when countdown finishes
export default function CountdownOverlay({ onDone }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    playBeep(STEPS[0].freq, step === 3 ? 0.3 : 0.12);
  }, []); // play on mount for step 0

  useEffect(() => {
    if (step === 0) return; // already played on mount
    playBeep(STEPS[step].freq, step === 3 ? 0.4 : 0.12);
  }, [step]);

  useEffect(() => {
    const delay = step === 3 ? 900 : 1000;
    const timer = setTimeout(() => {
      if (step < 3) {
        setStep(s => s + 1);
      } else {
        onDone();
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [step, onDone]);

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`font-display font-black select-none ${step === 3 ? 'text-5xl md:text-7xl' : 'text-8xl md:text-[10rem]'} ${current.color} drop-shadow-lg text-center`}
        >
          {current.label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}