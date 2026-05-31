import React, { useMemo } from 'react';
import { Dream } from '../types';
import { format, subDays, eachDayOfInterval, isSameDay, startOfISOWeek, subWeeks, addDays, startOfMonth } from 'date-fns';
import { Flame } from 'lucide-react';
import { cn } from '../utils';
import { useSettings } from '../useSettings';

interface StatsProps {
  dreams: Dream[];
}

function getWeeklyStreak(dreams: Dream[]) {
  const ldDreams = dreams.filter(d => d.isLucid && d.date);
  
  const byWeek = ldDreams.reduce((acc, d) => {
    const date = new Date(String(d.date) + 'T12:00:00Z');
    const weekStart = format(startOfISOWeek(date), 'yyyy-MM-dd');
    if (!acc[weekStart]) acc[weekStart] = { dreams: [], days: new Set<string>() };
    acc[weekStart].dreams.push(d);
    acc[weekStart].days.add(String(d.date));
    return acc;
  }, {} as Record<string, { dreams: Dream[], days: Set<string> }>);

  const isWeekSuccessful = (weekStartStr: string) => {
    const weekData = byWeek[weekStartStr];
    if (!weekData) return false;
    
    const byDate = weekData.dreams.reduce((acc, d) => {
      acc[String(d.date)] = (acc[String(d.date)] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    if (Object.values(byDate).some(count => count >= 2)) return true;

    if (weekData.days.size > 3) return true;

    const sortedDays = Array.from(weekData.days).sort();
    for (let i = 0; i < sortedDays.length - 1; i++) {
       const today = new Date(sortedDays[i] + 'T12:00:00Z');
       const tomorrow = addDays(today, 1);
       if (format(tomorrow, 'yyyy-MM-dd') === sortedDays[i+1]) {
         return true;
       }
    }
    
    return false;
  };
  
  let streak = 0;
  const thisWeek = format(startOfISOWeek(new Date()), 'yyyy-MM-dd');
  const lastWeek = format(subWeeks(startOfISOWeek(new Date()), 1), 'yyyy-MM-dd');
  
  let checkWeek = thisWeek;
  if (!isWeekSuccessful(checkWeek) && isWeekSuccessful(lastWeek)) {
      checkWeek = lastWeek;
  }
  
  while (isWeekSuccessful(checkWeek)) {
      streak++;
      checkWeek = format(subWeeks(new Date(checkWeek + 'T12:00:00Z'), 1), 'yyyy-MM-dd');
  }
  
  return {
    streak,
    hasActiveFire: streak > 0 || isWeekSuccessful(thisWeek)
  };
}

export function Stats({ dreams }: StatsProps) {
  const { settings, updateSettings } = useSettings();

  const { streak, hasActiveFire } = useMemo(() => getWeeklyStreak(dreams), [dreams]);

  const activeDaysCount = useMemo(() => {
    const dates = new Set(dreams.filter(d => d.date).map(d => d.date));
    return dates.size;
  }, [dreams]);

  const totalLucid = useMemo(() => dreams.filter(d => d.isLucid).length, [dreams]);
  
  const weeklyNodes = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today
    });

    return last7Days.map(date => {
      const dayDreams = dreams.filter(d => d.date && isSameDay(new Date(d.date + 'T12:00:00Z'), date));
      return {
        date,
        count: dayDreams.length,
        hasLucid: dayDreams.some(d => d.isLucid),
        hasWBTB: dayDreams.some(d => d.isWBTB)
      };
    });
  }, [dreams]);

  const currentMonthLogs = useMemo(() => {
    const start = startOfMonth(new Date());
    return dreams.filter(d => d.date && new Date(String(d.date) + 'T12:00:00Z').getTime() >= start.getTime()).length;
  }, [dreams]);

  const currentMonthLucids = useMemo(() => {
    const start = startOfMonth(new Date());
    return dreams.filter(d => d.isLucid && d.date && new Date(String(d.date) + 'T12:00:00Z').getTime() >= start.getTime()).length;
  }, [dreams]);

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
        <div className="border border-white/10 bg-black/20 backdrop-blur-md p-4 flex flex-col justify-between h-24">
          <span className="text-[9px] font-mono tracking-widest text-white/50">TOTAL LOGS</span>
          <span className="text-3xl font-display font-medium leading-none text-white">{dreams.length}</span>
        </div>
        <div className="border border-white/10 bg-black/20 backdrop-blur-md p-4 flex flex-col justify-between h-24">
          <span className="text-[9px] font-mono tracking-widest text-white/50">ACTIVE DAYS</span>
          <span className="text-3xl font-display font-medium leading-none text-white">{activeDaysCount}</span>
        </div>
        <div className="border border-green-500/20 bg-green-500/10 backdrop-blur-md p-4 flex flex-col justify-between h-24">
          <span className="text-[9px] font-mono tracking-widest text-green-300 font-semibold">LUCID COUNT</span>
          <span className="text-3xl font-display font-medium text-green-300 leading-none">{totalLucid}</span>
        </div>
        <div className="border border-white/10 bg-black/20 backdrop-blur-md p-4 flex flex-col justify-between h-24">
          <span className="text-[9px] font-mono tracking-widest text-white/50">AVG MOOD</span>
          <span className="text-3xl font-display font-medium leading-none text-white">
             {dreams.length ? (dreams.reduce((acc, d) => {
               const val = typeof d.mood === 'object' ? (d.mood.average || 0) : d.mood;
               return acc + val;
             }, 0) / dreams.length).toFixed(1) : '0'}
          </span>
        </div>
      </div>

      {/* Weekly Progress Node View */}
      <div className="border border-white/10 bg-black/20 backdrop-blur-md p-4 space-y-4 animate-fade-in">
        <div className="flex justify-between items-center border-b border-white/10 pb-1 w-full">
          <h3 className="text-xs font-mono tracking-widest text-white uppercase font-bold">WEEKLY PROGRESS</h3>
          {hasActiveFire && (
            <div className="flex items-center gap-1 text-white" title={`Active Streak: ${streak} weeks`}>
              <Flame size={14} className="fill-white stroke-white" />
              {streak > 0 && <span className="text-[10px] font-bold font-mono">{streak}</span>}
            </div>
          )}
        </div>
        <div className="flex gap-2 w-full justify-between pb-2 mt-4">
          {weeklyNodes.map((node, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
              <span className="text-[9px] font-mono text-white/50 uppercase">{format(node.date, 'EEEEE')}</span>
              <div 
                className={cn(
                  "border flex flex-col transition-colors relative w-full aspect-square max-w-[48px]",
                  node.count > 0 ? "bg-white/20 border-white/40" : "bg-black/10 border-white/10"
                )}
                title={`${format(node.date, 'MMM dd')}: ${node.count} logs`}
              >
                <div className="flex-1 flex items-center justify-center">
                  {node.count > 0 && <span className="text-white text-[11px] font-bold font-mono">{node.count}</span>}
                </div>
                {/* Embedded custom indicators sitting centered on the bottom border lines of the box */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center gap-[3px] pointer-events-none z-10">
                   {node.hasLucid && <div className="w-2.5 h-2.5 bg-green-400 border border-black/50 shadow-xs" title="Lucid" />}
                   {node.hasWBTB && <div className="w-2.5 h-2.5 bg-blue-400 border border-black/50 shadow-xs" title="WBTB" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals Tracker */}
      <div className="grid grid-cols-2 gap-3 animate-fade-in">
        <div className="border border-white/10 bg-black/20 backdrop-blur-md p-4">
          <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase mb-3">Logs Target (M)</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-display font-medium leading-none text-white">{currentMonthLogs}</span>
            <div className="flex items-center border-b border-white/20 text-white/60 mb-0.5">
              <span className="text-xs font-mono mr-1">/</span>
              <input
                type="number"
                value={settings.targetLogs}
                onChange={(e) => updateSettings({ targetLogs: parseInt(e.target.value) || 0 })}
                className="w-10 bg-transparent outline-none text-sm font-mono text-white"
              />
            </div>
          </div>
        </div>
        <div className="border border-green-500/20 bg-green-500/10 backdrop-blur-md p-4">
          <div className="text-[10px] font-mono tracking-widest text-green-300 uppercase mb-3">Lucids Target (M)</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-display font-medium leading-none text-green-300">{currentMonthLucids}</span>
            <div className="flex items-center border-b border-green-400/30 text-green-400/60 mb-0.5">
              <span className="text-xs font-mono mr-1">/</span>
              <input
                type="number"
                value={settings.targetLucids}
                onChange={(e) => updateSettings({ targetLucids: parseInt(e.target.value) || 0 })}
                className="w-10 bg-transparent outline-none text-sm font-mono text-green-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
