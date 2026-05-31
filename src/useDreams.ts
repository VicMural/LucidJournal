import { useState, useEffect } from 'react';
import { Dream } from './types';
import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch, serverTimestamp, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { useAuth } from './hooks/useAuth';

export function useDreams() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { user, setError } = useAuth();

  useEffect(() => {
    if (!user) {
      setDreams([]);
      setLoaded(true);
      return;
    }

    const path = `users/${user.uid}/dreams`;
    const q = query(collection(db, path));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDreams = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          // Convert serverTimestamp to local if needed, but we keep it intact here
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
          updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
        } as unknown as Dream;
      });
      
      const sorted = fetchedDreams.sort((a, b) => {
        if (!a.date && !b.date) return b.timestamp - a.timestamp;
        if (!a.date) return 1;
        if (!b.date) return -1;
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff === 0) {
            return (a.orderIndex || 0) - (b.orderIndex || 0);
        }
        return dateDiff;
      });
      
      setDreams(sorted);
      setLoaded(true);
    }, (error) => {
      console.error('Firestore onSnapshot active stream list error:', error);
      setError('Database Connection Notice: Failed to synchronize dreams. This can happen if security rules are still being deployed or if the Firestore project database has not been created yet in your console. Direct error: ' + (error instanceof Error ? error.message : String(error)));
      setLoaded(true); // Ensure application renders so warning is seen
    });

    return unsubscribe;
  }, [user, setError]);

  const addDream = async (dream: Dream) => {
    if (!user) return;
    const path = `users/${user.uid}/dreams`;
    try {
      const dreamRef = doc(db, path, dream.id);
      const firestoreDream = {
        ...dream,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(dreamRef, firestoreDream);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteDream = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/dreams`;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  };

  const importDreams = async (imported: Dream[], overwrite = false) => {
    if (!user) return;
    const path = `users/${user.uid}/dreams`;
    
    try {
      const batch = writeBatch(db);
      
      if (overwrite) {
        // Since we can't easily bulk delete without fetching, we just delete currently loaded
        dreams.forEach(d => {
          batch.delete(doc(db, path, d.id));
        });
      }

      imported.forEach(d => {
        if (overwrite || !dreams.find(existing => existing.id === d.id)) {
           const dreamRef = doc(db, path, d.id);
           batch.set(dreamRef, {
             ...d,
             userId: user.uid,
             createdAt: serverTimestamp(),
             updatedAt: serverTimestamp()
           });
        }
      });
      
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return { dreams, addDream, deleteDream, importDreams, loaded };
}
