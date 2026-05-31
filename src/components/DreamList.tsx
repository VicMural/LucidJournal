import React, { useState } from 'react';
import { Dream } from '../types';
import { format } from 'date-fns';
import { cn } from '../utils';
import { Moon, Archive, Clock, Trash } from 'lucide-react';

interface DreamListProps {
  dreams: Dream[];
  onDelete: (id: string) => void;
}

export function DreamList({ dreams, onDelete }: DreamListProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (dreams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-white/50 border border-dashed border-white/20 bg-black/20 backdrop-blur-sm">
        <Moon size={32} className="mb-4 opacity-30" />
        <p className="text-sm font-mono tracking-widest uppercase text-center">NO ENTRIES FOUND</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dreams.map((dream) => {
        const isExpanded = expandedIds[dream.id];
        return (
          <article key={dream.id} className="border border-white/10 bg-black/20 backdrop-blur-md p-5 md:p-6 group relative overflow-hidden break-words w-full max-w-full min-w-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full max-w-full min-w-0">
              <div className="flex-1 min-w-0 w-full max-w-full">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-xs font-mono font-bold tracking-widest text-white bg-white/10 px-2 py-1">
                    {dream.date ? format(new Date(dream.date), 'MMM dd, yyyy') : 'UNKNOWN DATE'}
                  </span>
                  
                  {dream.isLucid && (
                    <span className="text-xs font-mono font-medium tracking-widest text-green-300 px-2 py-1 bg-green-500/10 border border-green-500/20 flex items-center gap-1">
                      <Moon size={12} />
                      LUCID
                    </span>
                  )}
                  
                  {dream.isWBTB && (
                    <span className="text-xs font-mono font-medium tracking-widest text-blue-300 px-2 py-1 bg-blue-500/10 border border-blue-500/20 flex items-center gap-1">
                      <Clock size={12} />
                      WBTB
                    </span>
                  )}

                  {dream.isOriginalArchive && (
                    <span className="text-xs font-mono font-medium tracking-widest text-white px-2 py-1 bg-white/10 flex items-center gap-1">
                      <Archive size={12} strokeWidth={1.5} />
                      ARCHIVE
                    </span>
                  )}
                </div>

                {dream.title && (
                  <h3 className="text-xl font-display font-medium mb-2 text-white truncate max-w-full" title={dream.title}>
                    {dream.title}
                  </h3>
                )}
                
                <p 
                  onClick={() => toggleExpand(dream.id)}
                  className={cn(
                    "text-white/80 leading-relaxed whitespace-pre-wrap cursor-pointer transition-all hover:text-white",
                    !isExpanded && "line-clamp-4 overflow-hidden text-ellipsis"
                  )}
                >
                  {dream.content}
                </p>

                {!isExpanded && dream.content.length > 280 && (
                  <button 
                    onClick={() => toggleExpand(dream.id)}
                    className="mt-2 text-[10px] font-mono text-white/50 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Read full entry
                  </button>
                )}

                {isExpanded && dream.content.length > 280 && (
                  <button 
                    onClick={() => toggleExpand(dream.id)}
                    className="mt-2 text-[10px] font-mono text-white/50 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    Show less
                  </button>
                )}
                
                <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono tracking-widest text-white/50">MOOD (AVG)</span>
                    <div className={cn("w-6 h-6 flex items-center justify-center border text-[10px] font-bold rounded-full",
                      (typeof dream.mood === 'object' ? dream.mood.average || 0 : dream.mood) > 0 ? "border-green-400 text-green-300 bg-green-500/10" : 
                      (typeof dream.mood === 'object' ? dream.mood.average || 0 : dream.mood) < 0 ? "border-red-400 text-red-300 bg-red-500/10" : 
                      "border-white/20 text-white/70 bg-white/5")}>
                      {Math.abs(typeof dream.mood === 'object' ? dream.mood.average || 0 : dream.mood)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono tracking-widest text-white/50">CLARITY (AVG)</span>
                    <div className={cn("w-6 h-6 flex items-center justify-center border text-[10px] font-bold rounded-full", 
                      (typeof dream.clarity === 'object' ? dream.clarity.average || 0 : dream.clarity) > 0 ? "border-blue-400 text-blue-300 bg-blue-500/10" : 
                      (typeof dream.clarity === 'object' ? dream.clarity.average || 0 : dream.clarity) < 0 ? "border-orange-400 text-orange-300 bg-orange-500/10" : 
                      "border-white/20 text-white/70 bg-white/5")}>
                      {Math.abs(typeof dream.clarity === 'object' ? dream.clarity.average || 0 : dream.clarity)}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onDelete(dream.id)}
                className="absolute top-4 right-4 p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Entry"
              >
                <Trash size={16} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
