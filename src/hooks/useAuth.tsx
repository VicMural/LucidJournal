import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logOut: () => Promise<void>;
  setError: (val: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signInGuest: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logOut: async () => {},
  setError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err?.code === 'auth/unauthorized-domain') {
        setError('Unauthorized Domain: Log into your Firebase Console, navigate to "Authentication" > "Settings" > "Authorized domains" and add your Vercel or local domain.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError('Operation Not Allowed: Google Sign-In is not enabled on your Firebase project. Go to "Authentication" > "Sign-in method" in your Firebase console and enable "Google".');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in window was closed before completing. Please try again.');
      } else {
        setError(err?.message || 'An unexpected authentication error occurred.');
      }
    }
  };

  const signInGuest = async () => {
    try {
      setError(null);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Anonymous sign-in error:', err);
      if (err?.code === 'auth/operation-not-allowed') {
        setError('Guest access not allowed: Go to "Authentication" > "Sign-in method" in your Firebase console and enable the "Anonymous" provider.');
      } else {
        setError(err?.message || 'Failed to start guest session.');
      }
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('Invalid Email or Password. Please verify your details or Sign Up if you are new.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is disabled in Firebase Console. Go to "Authentication" > "Sign-in method" and enable "Email/Password".');
      } else {
        setError(err?.message || 'Failed to sign in with email.');
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email sign-up error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another account. Please try logging in instead.');
      } else if (err?.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a password that is at least 6 characters long.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError('Email sign up is disabled. Turn "Email/Password" on inside the "Sign-in method" page of Firebase console.');
      } else {
        setError(err?.message || 'Failed to register account.');
      }
      throw err;
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      signIn, 
      signInGuest, 
      signInWithEmail, 
      signUpWithEmail, 
      logOut, 
      setError 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

