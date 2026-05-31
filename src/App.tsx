import React, { useState } from 'react';
import { useDreams } from './useDreams';
import { DreamForm } from './components/DreamForm';
import { DreamList } from './components/DreamList';
import { Stats } from './components/Stats';
import { Plus, BookOpen, BarChart2, Archive, ChevronRight, ChevronLeft, Settings } from 'lucide-react';
import { cn } from './utils';
import { motion, AnimatePresence } from 'motion/react';
import { SettingsModal } from './components/SettingsModal';
import { ThemeBackground } from './components/ThemeBackground';
import { useSettings } from './useSettings';
import { useAuth } from './hooks/useAuth';

function MainApp() {
  const { dreams, addDream, deleteDream, importDreams, loaded } = useDreams();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats'>('timeline');
  const [isViewingArchive, setIsViewingArchive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rotateDeg, setRotateDeg] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!loaded) return null;

  const activeDreams = dreams.filter(d => !d.isOriginalArchive);
  const archiveDreams = dreams.filter(d => d.isOriginalArchive);

  const handleTabChange = (tab: 'timeline' | 'stats') => {
    setActiveTab(tab);
    if (tab !== 'timeline') {
      setIsViewingArchive(false);
    }
  };

  return (
    <>
      <ThemeBackground themeName={settings.themeColor} speed={settings.flowSpeed} />
      <div className={cn("font-sans antialiased relative z-0", activeTab === 'stats' ? "h-screen overflow-hidden" : "min-h-screen pb-24")}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-display font-bold tracking-tight text-white drop-shadow-sm">LUCID JOURNAL</h1>
            <nav className="hidden md:flex gap-4">
               <button 
                  onClick={() => { handleTabChange('timeline'); }}
                  className={cn("text-xs font-mono tracking-widest px-3 py-2 transition-colors", (activeTab === 'timeline' && !isViewingArchive) ? "text-white border-b-2 border-white/50" : "text-white/50 hover:text-white")}
               >
                  TIMELINE
               </button>
               <button 
                  onClick={() => { handleTabChange('stats'); }}
                  className={cn("text-xs font-mono tracking-widest px-3 py-2 transition-colors", activeTab === 'stats' ? "text-white border-b-2 border-white/50" : "text-white/50 hover:text-white")}
               >
                  STATS
               </button>
               {archiveDreams.length > 0 && (
                 <button 
                    onClick={() => { setActiveTab('timeline'); setIsViewingArchive(true); }}
                    className={cn("text-xs font-mono tracking-widest px-3 py-2 transition-colors flex items-center gap-1", (activeTab === 'timeline' && isViewingArchive) ? "text-white border-b-2 border-white/50" : "text-white/50 hover:text-white")}
                 >
                    <Archive size={12} strokeWidth={1.5} /> ARCHIVES
                 </button>
               )}
            </nav>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-10 h-10 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 hover:bg-white/10 transition-colors"
                title="Settings & Export/Import"
              >
                <Settings size={18} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="hidden md:flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors shadow-sm"
              >
                <Plus size={16} strokeWidth={2} />
                NEW ENTRY
              </button>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 overflow-hidden">
        {activeTab === 'timeline' ? (
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              {!isViewingArchive ? (
                <motion.div
                  key="timeline-list"
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 80, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                >
                  {/* Banner to archives */}
                  {archiveDreams.length > 0 && (
                     <div 
                       onClick={() => setIsViewingArchive(true)}
                       className="mb-6 border-b border-white/10 pb-3 flex items-center justify-between cursor-pointer hover:border-white/30 transition-all group"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 flex items-center justify-center bg-white/20 border border-white/10 backdrop-blur-md text-white select-none">
                           <Archive size={14} strokeWidth={2} />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-display font-medium text-white">View archives</span>
                           <span className="text-[9px] font-mono text-white/50 uppercase">{archiveDreams.length} legacy logs stored</span>
                         </div>
                       </div>
                       <div className="flex items-center gap-1.5 text-white/50 group-hover:text-white/90 transition-colors">
                         <span className="text-[10px] font-mono tracking-widest uppercase">ENTER</span>
                         <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                       </div>
                     </div>
                  )}
                  <DreamList dreams={activeDreams} onDelete={deleteDream} />
                </motion.div>
              ) : (
                <motion.div
                  key="archive-list"
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -80, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                >
                  <div 
                    onClick={() => setIsViewingArchive(false)}
                    className="mb-6 border border-white/10 bg-black/20 backdrop-blur-md p-4 flex items-center gap-3 cursor-pointer hover:border-white/30 transition-all hover:bg-white/5 group shadow-sm"
                  >
                    <ChevronLeft size={18} className="text-white/50 group-hover:text-white transition-colors" strokeWidth={1.5} />
                    <div className="flex flex-col">
                      <span className="text-sm font-display font-medium text-white">Back to Timeline</span>
                      <span className="text-[10px] font-mono text-white/50 uppercase">Viewing Archives</span>
                    </div>
                  </div>
                  <DreamList dreams={archiveDreams} onDelete={deleteDream} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Stats dreams={activeDreams} />
        )}
      </main>

      {/* Mobile Navigation - Perfectly Centered */}
      <motion.div 
         initial={{ y: 0 }}
         animate={{ y: isFormOpen ? 120 : 0 }}
         transition={{ type: 'spring', stiffness: 260, damping: 26 }}
         className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-xl z-20 flex justify-between items-stretch h-16"
      >
         <button 
            onClick={() => handleTabChange('timeline')}
            className={cn("flex flex-col items-center justify-center gap-1 p-2 flex-1 pb-safe transition-colors", (activeTab === 'timeline' && !isViewingArchive) ? "text-white font-bold" : "text-white/50")}
         >
            <BookOpen size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-mono tracking-widest">LOGS</span>
         </button>
         
         <button 
            onClick={() => {
              setRotateDeg(prev => prev + 360);
              setTimeout(() => {
                setIsFormOpen(true);
              }, 180);
            }}
            className="bg-white/10 border-x border-white/10 text-white flex items-center justify-center shrink-0 w-16 active:bg-white/20 transition-colors"
         >
            <motion.div
              animate={{ rotate: rotateDeg }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex items-center justify-center drop-shadow-md"
            >
              <Plus size={24} />
            </motion.div>
         </button>

         <button 
            onClick={() => handleTabChange('stats')}
            className={cn("flex flex-col items-center justify-center gap-1 p-2 flex-1 pb-safe transition-colors", activeTab === 'stats' ? "text-white font-bold" : "text-white/50")}
         >
            <BarChart2 size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-mono tracking-widest">STATS</span>
         </button>
      </motion.div>

      <AnimatePresence>
        {isFormOpen && (
          <DreamForm dreams={dreams} onAdd={addDream} onClose={() => setIsFormOpen(false)} />
        )}
        {isSettingsOpen && (
          <SettingsModal 
            dreams={dreams} 
            settings={settings}
            updateSettings={updateSettings}
            onImport={(imported, overwrite) => importDreams(imported, overwrite)} 
            onClearAll={() => importDreams([], true)} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        )}
      </AnimatePresence>
      </div>
    </>
  );
}

export default function App() {
  const { user, loading, signIn } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
        <ThemeBackground themeName="twilight" speed={50} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 p-8 md:p-12 border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col items-center max-w-sm w-full shadow-2xl"
        >
          <div className="w-12 h-12 bg-white/10 border border-white/20 flex items-center justify-center text-white mb-6">
            <BookOpen size={24} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2 tracking-tight text-center">LUCID JOURNAL</h1>
          <p className="text-white/60 text-sm mb-8 text-center balance">
            Secure, synchronized dream journaling across all your devices.
          </p>
          <button 
            onClick={signIn}
            className="w-full bg-white text-black py-3 px-4 text-sm font-medium hover:bg-white/90 transition-colors shadow-lg shadow-white/10"
          >
            SIGN IN WITH GOOGLE
          </button>
        </motion.div>
      </div>
    );
  }

  return <MainApp />;
}
