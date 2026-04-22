'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const PHASES = {
  FOCUS: { time: 25 * 60, label: 'FOCUSING' },
  SHORT_BREAK: { time: 5 * 60, label: 'SHORT BREAK' },
  LONG_BREAK: { time: 20 * 60, label: 'LONG BREAK' },
};

export default function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(PHASES.FOCUS.time);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');
  const [sessionCount, setSessionCount] = useState(1);
  const [mounted, setMounted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem('pomodoroState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        const now = Date.now();
        
        if (parsed.isActive && parsed.targetTime) {
          const remaining = Math.round((parsed.targetTime - now) / 1000);
          if (remaining > 0) {
            setTimeLeft(remaining);
            setIsActive(true);
            setMode(parsed.mode);
            setSessionCount(parsed.sessionCount || 1);
          } else {
            handleTimerComplete(parsed.mode, parsed.sessionCount || 1);
          }
        } else {
          setTimeLeft(parsed.timeLeft);
          setIsActive(parsed.isActive);
          setMode(parsed.mode);
          setSessionCount(parsed.sessionCount || 1);
        }
      } catch (e) {
        console.error("Failed to parse pomodoro state", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const targetTime = isActive ? Date.now() + timeLeft * 1000 : null;
    localStorage.setItem('pomodoroState', JSON.stringify({
      timeLeft,
      isActive,
      mode,
      sessionCount,
      targetTime
    }));
  }, [timeLeft, isActive, mode, sessionCount, mounted]);

  const playDing = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const handleTimerComplete = (currentMode: string, currentSession: number) => {
    playDing();
    setIsActive(false);
    
    if (currentMode === 'FOCUS') {
      if (currentSession >= 4) {
        setMode('LONG_BREAK');
        setTimeLeft(PHASES.LONG_BREAK.time);
        setSessionCount(1);
      } else {
        setMode('SHORT_BREAK');
        setTimeLeft(PHASES.SHORT_BREAK.time);
        setSessionCount(currentSession + 1);
      }
    } else {
      setMode('FOCUS');
      setTimeLeft(PHASES.FOCUS.time);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft <= 0) {
      handleTimerComplete(mode, sessionCount);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, sessionCount]);

  const toggleTimer = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(PHASES[mode].time);
  };

  if (!mounted) return null;

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
  const totalTime = PHASES[mode].time;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: "var(--glass-bg)",
      padding: "8px 14px",
      borderRadius: "20px",
      border: "1px solid var(--glass-border)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
      marginTop: "10px",
      minWidth: "160px"
    }}>
      <div style={{ position: "relative", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* SVG Ring */}
        <svg width="44" height="44" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
          <circle cx="22" cy="22" r={radius} fill="transparent" stroke="rgba(138, 43, 226, 0.15)" strokeWidth="3" />
          <circle cx="22" cy="22" r={radius} fill="transparent" stroke="#8A2BE2" strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        
        {/* Timer Text */}
        <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8rem", color: "var(--text-primary)", zIndex: 1, letterSpacing: "-0.5px" }}>
          {minutes}:{seconds}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#8A2BE2", letterSpacing: "0.5px" }}>
          {PHASES[mode].label} {mode === "FOCUS" ? `(${sessionCount}/4)` : ""}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={toggleTimer} style={{ background: "#8A2BE2", color: "white", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title={isActive ? "Pause" : "Start"} className="hover-opacity">
            {isActive ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
          </button>
          <button onClick={resetTimer} style={{ background: "transparent", color: "var(--text-muted)", border: "1px solid var(--glass-border)", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Reset" className="hover-opacity">
            <RotateCcw size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
