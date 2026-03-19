import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { hashPin } from '@/lib/crypto';
import * as secureStorage from '@/lib/secureStorage';

const PIN_HASH_KEY = 'gerenciador-vencimentos-pin-hash';
const AUTO_LOCK_DELAY_MS = 30_000; // 30 seconds

type AuthState = 'loading' | 'setup' | 'locked' | 'unlocked';

interface AuthContextValue {
  state: AuthState;
  setup: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  resetAll: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>('loading');
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const pinHash = localStorage.getItem(PIN_HASH_KEY);
    setState(pinHash ? 'locked' : 'setup');
  }, []);

  const setup = useCallback(async (pin: string) => {
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_HASH_KEY, hash);
    await secureStorage.init(pin);
    await secureStorage.migrateFromPlaintext();
    setState('unlocked');
  }, []);

  const unlock = useCallback(async (pin: string) => {
    const storedHash = localStorage.getItem(PIN_HASH_KEY);
    const inputHash = await hashPin(pin);

    if (inputHash !== storedHash) return false;

    await secureStorage.init(pin);
    setState('unlocked');
    return true;
  }, []);

  const lock = useCallback(() => {
    secureStorage.clear();
    setState('locked');
  }, []);

  const resetAll = useCallback(() => {
    localStorage.clear();
    secureStorage.clear();
    setState('setup');
  }, []);

  // Auto-lock when app goes to background
  useEffect(() => {
    if (state !== 'unlocked') return;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        lockTimerRef.current = setTimeout(() => {
          lock();
        }, AUTO_LOCK_DELAY_MS);
      } else {
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [state, lock]);

  return (
    <AuthContext.Provider value={{ state, setup, unlock, lock, resetAll }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
