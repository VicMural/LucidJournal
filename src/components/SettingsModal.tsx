import React, { useState, useRef } from 'react';
import { Dream } from '../types';
import { motion } from 'motion/react';
import { X, Download, Upload, Trash2, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils';
import { Settings } from '../useSettings';
import { PALETTES } from './ThemeBackground';
import { useAuth } from '../hooks/useAuth';

interface SettingsModalProps {
  dreams: Dream[];
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  onImport: (dreams: Dream[], overwrite: boolean) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function SettingsModal({ dreams, settings, updateSettings, onImport, onClearAll, onClose }: SettingsModalProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logOut } = useAuth();

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(dreams, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const dateString = format(new Date(), 'yyyy-MM-dd-HHmm');
      link.download = `lucid-journal-backup-${dateString}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccessMsg('Backup downloaded successfully');
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg('Failed to export dreams');
      setSuccessMsg(null);
    }
  };

  const validateAndImport = (fileText: string) => {
    try {
      const parsed = JSON.parse(fileText);
      if (!Array.isArray(parsed)) {
        throw new Error('Backup must be an array of dreams');
      }

      // Basic validation of fields
      const validated: Dream[] = parsed.filter(item => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof item.title === 'string' &&
          typeof item.content === 'string' &&
          (item.id === undefined || typeof item.id === 'string' || typeof item.id === 'number')
        );
      }).map(item => ({
        id: item.id ? String(item.id) : String(Math.random()),
        timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
        date: typeof item.date === 'string' ? item.date : null,
        orderIndex: typeof item.orderIndex === 'number' ? item.orderIndex : 0,
        title: item.title,
        content: item.content,
        mood: item.mood !== undefined ? item.mood : 0,
        clarity: item.clarity !== undefined ? item.clarity : 0,
        isLucid: Boolean(item.isLucid),
        isWBTB: Boolean(item.isWBTB),
        isOriginalArchive: Boolean(item.isOriginalArchive)
      }));

      if (validated.length === 0 && parsed.length > 0) {
        throw new Error('No valid dream entries found in this backup');
      }

      onImport(validated, importMode === 'overwrite');
      setSuccessMsg(`Successfully imported ${validated.length} dream logs (${importMode === 'overwrite' ? 'overwrote' : 'merged with'} current records)`);
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid backup format. Ensure it is a valid JSON export.');
      setSuccessMsg(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        validateAndImport(text);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        validateAndImport(text);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    onClearAll();
    setShowClearConfirm(false);
    setSuccessMsg('All custom dream records have been permanently cleared.');
    setErrorMsg(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xl flex flex-col no-scrollbar overflow-y-auto px-4 py-6 text-white"
    >
      <div className="max-w-md w-full mx-auto my-auto flex flex-col pt-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">System Maintenance</span>
            <h2 className="text-2xl font-display font-medium text-white">Settings & Backups</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 border border-white/20 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/40 transition-colors backdrop-blur-md"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 border border-red-500/50 bg-red-900/40 text-red-100 flex gap-3 text-sm backdrop-blur-md">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 border border-green-500/50 bg-green-900/40 text-green-100 flex gap-3 text-sm backdrop-blur-md">
            <Check size={18} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Account Section */}
          <section className="border border-white/10 bg-black/20 p-5 space-y-4 backdrop-blur-md">
            <div>
              <h3 className="text-sm font-display font-semibold text-white">Account Details</h3>
              <p className="text-xs text-white/50 mt-1">
                Currently signed in as {user?.isAnonymous ? "Guest Session (Secure & Private)" : (user?.email || "Signed In User")}.
              </p>
            </div>
            <button
              onClick={logOut}
              className="w-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 py-2.5 px-4 text-[11px] font-mono tracking-wider transition-colors"
            >
              SIGN OUT
            </button>
          </section>

          {/* Appearance Section */}
          <section className="border border-white/10 bg-black/20 p-5 space-y-4 backdrop-blur-md">
            <div>
              <h3 className="text-sm font-display font-semibold text-white">Application Theme</h3>
              <p className="text-xs text-white/50 mt-1">
                Customize the ambient flowing gradient background.
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Color Palette</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(PALETTES).map(themeName => (
                  <button
                    key={themeName}
                    onClick={() => updateSettings({ themeColor: themeName })}
                    className={cn(
                      "aspect-square rounded-full border-2 transition-all p-0.5",
                      settings.themeColor === themeName ? "border-white scale-110" : "border-transparent hover:scale-105"
                    )}
                    title={themeName}
                  >
                    <div 
                      className="w-full h-full rounded-full" 
                      style={{ background: `linear-gradient(135deg, ${PALETTES[themeName][0]}, ${PALETTES[themeName][2]})` }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono tracking-widest text-white/40 uppercase flex items-center gap-2">
                  Flow Speed
                </label>
                <span className="text-[10px] font-mono text-white/60">{settings.flowSpeed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.flowSpeed}
                onChange={(e) => updateSettings({ flowSpeed: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase mt-1">
                <span>Still</span>
                <span>Active</span>
              </div>
            </div>
          </section>

          {/* Export Section */}
          <section className="border border-white/10 bg-black/20 p-5 space-y-4 backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-display font-semibold text-white">Export All Records</h3>
                <p className="text-xs text-white/50 mt-1">
                  Downloads all custom logs, legacy archives, and ratings so you can save them locally as a single backup file.
                </p>
              </div>
              <div className="bg-white/10 text-white/80 px-2 py-1 text-[10px] font-mono border border-white/10">
                {dreams.length} {dreams.length === 1 ? 'LOG' : 'LOGS'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={dreams.length === 0}
              className={cn(
                "w-full py-3 px-4 border text-xs font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-2 backdrop-blur-sm",
                dreams.length > 0 
                  ? "bg-white/10 border-white/30 text-white hover:bg-white/20" 
                  : "bg-black/10 border-white/5 text-white/30 cursor-not-allowed"
              )}
            >
              <Download size={14} />
              Save Local Backup
            </button>
          </section>

          {/* Import Section */}
          <section className="border border-white/10 bg-black/20 p-5 space-y-4 backdrop-blur-md">
            <div>
              <h3 className="text-sm font-display font-semibold text-white">Import & Restore</h3>
              <p className="text-xs text-white/50 mt-1">
                Upload a previously saved JSON backup file to restore your entries.
              </p>
            </div>

            {/* Merge vs Overwrite selection */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                type="button"
                onClick={() => setImportMode('merge')}
                className={cn(
                  "py-2 px-3 border text-[10px] font-mono tracking-widest uppercase transition-colors backdrop-blur-sm",
                  importMode === 'merge' 
                    ? "bg-white/20 border-white/40 text-white" 
                    : "border-white/10 text-white/50 hover:text-white hover:border-white/30 bg-black/20"
                )}
              >
                Merge Backup
              </button>
              <button
                type="button"
                onClick={() => setImportMode('overwrite')}
                className={cn(
                  "py-2 px-3 border text-[10px] font-mono tracking-widest uppercase transition-colors flex items-center justify-center gap-1 backdrop-blur-sm",
                  importMode === 'overwrite' 
                    ? "bg-red-500/20 border-red-400 text-red-100" 
                    : "border-white/10 text-white/50 hover:text-red-300 hover:border-red-400 hover:bg-red-900/20 bg-black/20"
                )}
              >
                Overwrite
              </button>
            </div>

            <div className="text-[10px] text-white/40 font-mono italic">
              {importMode === 'merge' 
                ? "• Keeps existing items and appends new records. Combines seamlessly." 
                : "• Warning: completely resets and replaces all current items with this backup."}
            </div>

            {/* Drag & Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border border-dashed p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 backdrop-blur-md",
                isDragging 
                  ? "border-white bg-white/10 text-white" 
                  : "border-white/20 bg-black/10 hover:bg-white/5 text-white/60"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload size={20} className={cn("text-white/40", isDragging && "text-white")} />
              <div className="text-xs font-medium text-white">
                {isDragging ? 'Drop file to import' : 'Click or drag .json file here'}
              </div>
              <div className="text-[9px] font-mono text-white/40 uppercase">
                supports JSON files
              </div>
            </div>
          </section>

          {/* Destructive Section */}
          <section className="border border-white/10 bg-black/20 p-5 space-y-4 backdrop-blur-md">
            <div>
              <h3 className="text-sm font-display font-semibold text-white">Permanent Reset</h3>
              <p className="text-xs text-white/50 mt-1">
                Erase everything from your browser's local sandbox to start fresh.
              </p>
            </div>

            {!showClearConfirm ? (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                disabled={dreams.length === 0}
                className={cn(
                  "w-full py-3 px-4 border text-xs font-mono tracking-wider uppercase transition-colors flex items-center justify-center gap-2 backdrop-blur-sm",
                  dreams.length > 0
                    ? "border-red-500/30 hover:border-red-400 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                    : "border-white/5 text-white/20 bg-black/10 cursor-not-allowed"
                )}
              >
                <Trash2 size={14} />
                Erase Current Database
              </button>
            ) : (
              <div className="border border-red-500/30 bg-red-900/20 p-4 space-y-3 backdrop-blur-sm">
                <div className="text-xs text-red-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  Are you absolutely sure?
                </div>
                <div className="text-[11px] text-red-200/80">
                  This permanently removes all log files from your browser. There is no undo.
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex-1 py-1.5 bg-red-600/80 text-white hover:bg-red-500 text-[10px] font-mono uppercase tracking-widest backdrop-blur-sm border border-red-500"
                  >
                    Yes, Erase All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-1.5 bg-white/5 border border-white/20 hover:border-white/40 hover:bg-white/10 text-white/80 hover:text-white text-[10px] font-mono uppercase tracking-widest backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer info/credits */}
        <div className="mt-8 text-center text-[10px] font-mono text-white/30 uppercase tracking-widest pb-12">
          LUCID JOURNAL SYSTEM REVISION
        </div>
      </div>
    </motion.div>
  );
}
