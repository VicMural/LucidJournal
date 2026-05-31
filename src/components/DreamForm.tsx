import React, { useState, useEffect, useRef } from 'react';
import { Dream, ScaleValue, ScaleSet } from '../types';
import { generateId, cn } from '../utils';
import { format, subDays } from 'date-fns';
import { X, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ORDINAL_WORDS = [
  'First Dream',
  'Second Dream',
  'Third Dream',
  'Fourth Dream',
  'Fifth Dream',
  'Sixth Dream',
  'Seventh Dream',
  'Eighth Dream',
  'Ninth Dream',
  'Tenth Dream'
];

function getOrdinalWord(index: number): string {
  return ORDINAL_WORDS[index] || `Dream #${index + 1}`;
}

interface DreamFormProps {
  dreams: Dream[];
  onAdd: (dream: Dream) => void;
  onClose: () => void;
}

const SCALE_NODES: { value: ScaleValue; label: string }[] = [
  { value: -3, label: '-3' },
  { value: -2, label: '-2' },
  { value: -1, label: '-1' },
  { value: 0, label: '0' },
  { value: 1, label: '+1' },
  { value: 2, label: '+2' },
  { value: 3, label: '+3' },
];

const ScaleRow = ({ label, value, onChange }: { label: string, value: number | null, onChange: (v: number) => void }) => (
  <div className="space-y-4 w-full">
    <div className="flex justify-between items-end">
      <label className="text-[10px] font-mono font-medium tracking-widest text-white/50 uppercase">{label}</label>
      <span className="text-[10px] text-white/40 font-mono">
        {value === null ? 'UNTOUCHED' : value > 0 ? `+${value}` : value < 0 ? `${value}` : 'NEUTRAL'}
      </span>
    </div>
    <div className="flex justify-between relative w-full">
      {SCALE_NODES.map((node) => (
        <button
          key={node.value}
          type="button"
          onClick={() => onChange(node.value)}
          className={cn(
            "w-8 h-8 flex items-center justify-center text-[10px] font-mono border backdrop-blur-md transition-all",
            value === node.value 
              ? "border-white/50 bg-white/20 text-white shadow-sm" 
              : "border-white/20 bg-black/20 text-white/40 hover:border-white/40 hover:text-white"
          )}
        >
          {node.label.replace('+', '')}
        </button>
      ))}
    </div>
  </div>
);

export function DreamForm({ dreams, onAdd, onClose }: DreamFormProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  const [title, setTitle] = useState('');
  const [clarity, setClarity] = useState<ScaleSet>({ peak: null, average: null, lowest: null });
  const [mood, setMood] = useState<ScaleSet>({ peak: null, average: null, lowest: null });
  const [content, setContent] = useState('');
  
  const [dateOption, setDateOption] = useState<'today' | 'custom' | 'unknown'>('today');
  const [customDate, setCustomDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [orderIndex, setOrderIndex] = useState(0);

  const [isLucid, setIsLucid] = useState(false);
  const [isWBTB, setIsWBTB] = useState(false);
  const [isOriginalArchive, setIsOriginalArchive] = useState(false);

  const totalSteps = 6;

  const activeDate = dateOption === 'today' ? format(new Date(), 'yyyy-MM-dd') : dateOption === 'custom' ? customDate : null;
  const existingDreamsOnDate = activeDate ? dreams.filter(d => d.date === activeDate) : [];

  const handleNext = () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleSubmit = () => {
    onAdd({
      id: generateId(),
      timestamp: Date.now(),
      date: activeDate,
      orderIndex: activeDate && existingDreamsOnDate.length > 0 ? orderIndex : 0,
      title: title.trim(),
      content: content.trim(),
      mood,
      clarity,
      isLucid,
      isWBTB,
      isOriginalArchive,
    });
    onClose();
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col flex-1 justify-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-center text-white">Name your dream</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter dream title..."
              className="w-full text-center text-3xl md:text-4xl font-display border-b border-white/20 pb-2 bg-transparent focus:border-white placeholder:text-white/20 transition-colors text-white"
              autoFocus
            />
            <p className="text-[10px] uppercase font-mono tracking-widest text-center text-white/40">Optional</p>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col flex-1 justify-center space-y-8 md:space-y-12 shrink-0">
            <h2 className="text-2xl font-display font-medium tracking-tight text-center">Clarity</h2>
            <div className="space-y-8 w-full max-w-sm mx-auto">
              <ScaleRow label="PEAK CLARITY" value={clarity.peak} onChange={(v) => setClarity(p => ({ ...p, peak: v }))} />
              <ScaleRow label="AVERAGE" value={clarity.average} onChange={(v) => setClarity(p => ({ ...p, average: v }))} />
              <ScaleRow label="MOST MUDDLED" value={clarity.lowest} onChange={(v) => setClarity(p => ({ ...p, lowest: v }))} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col flex-1 justify-center space-y-8 md:space-y-12 shrink-0">
            <h2 className="text-2xl font-display font-medium tracking-tight text-center">Mood</h2>
            <div className="space-y-8 w-full max-w-sm mx-auto">
              <ScaleRow label="HIGHEST POINT" value={mood.peak} onChange={(v) => setMood(p => ({ ...p, peak: v }))} />
              <ScaleRow label="AVERAGE" value={mood.average} onChange={(v) => setMood(p => ({ ...p, average: v }))} />
              <ScaleRow label="LOWEST POINT" value={mood.lowest} onChange={(v) => setMood(p => ({ ...p, lowest: v }))} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col flex-1 max-h-full h-full pb-4 items-center w-full">
            <h2 className="text-xl font-display font-medium tracking-tight mb-4 mt-2 shrink-0 text-white">Dream Content</h2>
            <div className="flex-1 w-full max-w-xl bg-black/20 backdrop-blur-md border border-white/10 p-4 shrink min-h-0 flex flex-col focus-within:border-white/40 transition-colors shadow-sm">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type details about your dream here..."
                className="w-full flex-1 resize-none bg-transparent outline-none text-base md:text-lg leading-relaxed no-scrollbar text-white placeholder:text-white/20"
                autoFocus
                required
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col flex-1 justify-center space-y-8 items-center w-full">
            <h2 className="text-2xl font-display font-medium tracking-tight text-center">When did this happen?</h2>
            
            <div className="flex flex-col gap-4 max-w-sm w-full">
              <button
                type="button"
                onClick={() => setDateOption('today')}
                className={cn("px-4 py-4 border text-sm font-medium transition-colors w-full uppercase tracking-widest backdrop-blur-sm", dateOption === 'today' ? "bg-white/20 border-white/40 text-white" : "bg-black/20 border-white/10 text-white/60 hover:border-white/30 hover:text-white")}
              >
                Today
              </button>

              {/* 7 Quick Select Buttons row */}
              <div className="grid grid-cols-7 gap-1.5 w-full">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const daysBack = 7 - idx; // left will be -7, farthest right is -1
                  const targetDate = format(subDays(new Date(), daysBack), 'yyyy-MM-dd');
                  const isActive = dateOption === 'custom' && customDate === targetDate;
                  return (
                    <button
                      key={daysBack}
                      type="button"
                      onClick={() => {
                        setCustomDate(targetDate);
                        setDateOption('custom');
                      }}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center border font-mono text-xs transition-all backdrop-blur-sm",
                        isActive 
                          ? "bg-white/20 border-white/40 text-white font-bold" 
                          : "bg-black/20 border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                      )}
                      title={format(new Date(targetDate), 'PPP')}
                    >
                      <span className="text-[10px] font-mono">-{daysBack}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="relative">
                <input 
                  type="date" 
                  value={customDate} 
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setDateOption('custom');
                  }}
                  className="absolute inset-0 opacity-0 w-full cursor-pointer h-full z-10 block"
                />
                <div
                  className={cn("px-4 py-4 border text-sm font-medium transition-colors w-full uppercase tracking-widest flex items-center justify-center backdrop-blur-sm", (dateOption === 'custom' && !Array.from({ length: 7 }).some((_, i) => format(subDays(new Date(), 7 - i), 'yyyy-MM-dd') === customDate)) ? "bg-white/20 border-white/40 text-white" : "bg-black/20 border-white/10 text-white/60 hover:border-white/30 hover:text-white")}
                >
                  {dateOption === 'custom' ? format(new Date(customDate), 'MMM dd, yyyy') : 'Select Date'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDateOption('unknown')}
                className={cn("px-4 py-4 border text-sm font-medium transition-colors w-full uppercase tracking-widest backdrop-blur-sm", dateOption === 'unknown' ? "bg-white/20 border-white/40 text-white" : "bg-black/20 border-white/10 text-white/60 hover:border-white/30 hover:text-white")}
              >
                Unknown
              </button>
            </div>

            {existingDreamsOnDate.length > 0 && dateOption !== 'unknown' && (
              <div className="max-w-sm w-full mt-4 p-4 border border-white/10 bg-black/20 backdrop-blur-md space-y-3 shadow-sm">
                <label className="text-[10px] font-mono tracking-widest text-white/50 uppercase flex flex-col gap-1">
                  <span>Logged entries on this day</span>
                  <span className="text-white/40 font-normal">Order position of this entry:</span>
                </label>
                <select 
                  className="w-full border-b border-white/20 py-2 text-sm font-medium bg-transparent focus:outline-none text-white [&>option]:bg-zinc-900 [&>option]:text-white"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(Number(e.target.value))}
                >
                  {Array.from({ length: existingDreamsOnDate.length + 1 }).map((_, i) => (
                    <option key={i} value={i}>
                      {getOrdinalWord(i)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col flex-1 justify-center space-y-8 items-center w-full">
            <h2 className="text-2xl font-display font-medium tracking-tight text-center">Tags & Meta</h2>
            <div className="space-y-4 max-w-sm w-full">
              <button
                type="button"
                onClick={() => setIsLucid(!isLucid)}
                className={cn("flex items-center justify-between p-5 border transition-colors group w-full backdrop-blur-sm", isLucid ? "border-green-400 bg-green-500/10" : "border-white/10 bg-black/20")}
              >
                <span className={cn("text-sm font-medium tracking-widest uppercase", isLucid ? "text-green-300" : "text-white/60")}>Lucid Dream</span>
                <div className={cn("w-4 h-4 border", isLucid ? "bg-green-400 border-green-400" : "border-white/30")} />
              </button>

              <button
                type="button"
                onClick={() => setIsWBTB(!isWBTB)}
                className={cn("flex items-center justify-between p-5 border transition-colors group w-full backdrop-blur-sm", isWBTB ? "border-blue-400 bg-blue-500/10" : "border-white/10 bg-black/20")}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className={cn("text-sm font-medium tracking-widest uppercase", isWBTB ? "text-blue-300" : "text-white/60")}>WBTB Attempt</span>
                  <span className="text-[10px] text-white/40 font-mono">Wake Back To Bed</span>
                </div>
                <div className={cn("w-4 h-4 border", isWBTB ? "bg-blue-400 border-blue-400" : "border-white/30")} />
              </button>

              <button
                type="button"
                onClick={() => setIsOriginalArchive(!isOriginalArchive)}
                className={cn("flex items-center justify-between p-5 border transition-colors group w-full backdrop-blur-sm", isOriginalArchive ? "border-white/50 bg-white/10" : "border-white/10 bg-black/20")}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className={cn("text-sm font-medium tracking-widest uppercase", isOriginalArchive ? "text-white" : "text-white/60")}>Archive Import</span>
                  <span className="text-[10px] text-white/40 font-mono">From legacy journals</span>
                </div>
                <div className={cn("w-4 h-4 border shrink-0", isOriginalArchive ? "bg-white border-white" : " border-white/30")} />
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '105%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex flex-col no-scrollbar"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 shrink-0 h-16">
        <button onClick={onClose} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
          <X size={24} strokeWidth={1.5} />
        </button>
        <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
          Step {step}/{totalSteps}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            className="absolute inset-0 px-6 py-2 flex flex-col max-w-2xl mx-auto w-full h-full overflow-hidden"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -100 || offset.x < -100) {
                handleNext();
              } else if (swipe > 100 || offset.x > 100) {
                handlePrev();
              }
            }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="p-4 md:p-6 shrink-0 flex flex-col items-center gap-4 pb-safe bg-black/20 border-t border-white/5 backdrop-blur-md">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={cn("w-1.5 h-1.5 rounded-full transition-colors", i + 1 === step ? "bg-white scale-125" : i + 1 < step ? "bg-white/50" : "bg-white/10")} 
            />
          ))}
        </div>
        <div className="flex items-center justify-between w-full max-w-md mx-auto gap-2">
          <button
            onClick={handlePrev}
            className={cn("p-4 shrink-0 active:scale-95 transition-transform", step === 1 ? "opacity-0 pointer-events-none" : "text-white/50 hover:text-white")}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-4 bg-white/20 border border-white/30 text-white text-sm font-medium tracking-wide uppercase hover:bg-white/30 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 backdrop-blur-sm"
          >
            {step === totalSteps ? 'Save Dream' : 'Next'}
          </button>
          <div className="p-4 shrink-0 opacity-0 pointer-events-none">
            <ChevronRight size={24} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
