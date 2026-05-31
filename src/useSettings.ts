import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useAuth } from './hooks/useAuth';

export interface Settings {
  themeColor: string;
  flowSpeed: number; // 0 to 100
  targetLogs: number;
  targetLucids: number;
}

const DEFAULT_SETTINGS: Settings = {
  themeColor: 'twilight',
  flowSpeed: 50,
  targetLogs: 30,
  targetLucids: 4,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const { user, setError } = useAuth();
  
  useEffect(() => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }
    
    const path = `users/${user.uid}/settings/main`;
    
    const unsubscribe = onSnapshot(doc(db, path), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          themeColor: data.themeColor ?? DEFAULT_SETTINGS.themeColor,
          flowSpeed: data.flowSpeed ?? DEFAULT_SETTINGS.flowSpeed,
          targetLogs: data.targetLogs ?? DEFAULT_SETTINGS.targetLogs,
          targetLucids: data.targetLucids ?? DEFAULT_SETTINGS.targetLucids,
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    }, (error) => {
      console.error('Firestore onSnapshot doc settings error:', error);
      setError('Database Connection Notice (Settings): Failed to load settings. Direct error: ' + (error instanceof Error ? error.message : String(error)));
    });
    
    return unsubscribe;
  }, [user, setError]);

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!user) return;
    const path = `users/${user.uid}/settings/main`;
    try {
      const next = { ...settings, ...updates };
      setSettings(next); // Optimistic apply
      await setDoc(doc(db, path), {
        ...next,
        userId: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return { settings, updateSettings };
}
