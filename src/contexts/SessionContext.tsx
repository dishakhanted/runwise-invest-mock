/**
 * Session Context for managing auth vs demo mode
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type SessionMode = 'auth' | 'demo' | 'none';

export interface SessionState {
  mode: SessionMode;
  demoProfileId: string | null;
  user: User | null;
  isLoading: boolean;
}

interface SessionContextType extends SessionState {
  setDemoMode: (profileId: string) => void;
  clearSession: () => void;
  exitDemo: () => void;
  isDemo: boolean;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'growwise_session';

interface StoredSession {
  mode: SessionMode;
  demoProfileId: string | null;
}

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    mode: 'none',
    demoProfileId: null,
    user: null,
    isLoading: true,
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const loadStoredSession = () => {
      try {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed: StoredSession = JSON.parse(stored);
          if (parsed.mode === 'demo' && parsed.demoProfileId) {
            setSessionState(prev => ({
              ...prev,
              mode: 'demo',
              demoProfileId: parsed.demoProfileId,
              isLoading: false,
            }));
            return true;
          }
        }
      } catch (e) {
        console.error('Error loading stored session:', e);
      }
      return false;
    };

    const initializeAuth = async () => {
      // Check for demo session first
      const isDemoSession = loadStoredSession();
      
      if (!isDemoSession) {
        // Check for Supabase auth session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSessionState({
            mode: 'auth',
            demoProfileId: null,
            user: session.user,
            isLoading: false,
          });
        } else {
          setSessionState(prev => ({
            ...prev,
            mode: 'none',
            isLoading: false,
          }));
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Don't override demo mode
      if (sessionState.mode === 'demo') return;

      if (session?.user) {
        setSessionState({
          mode: 'auth',
          demoProfileId: null,
          user: session.user,
          isLoading: false,
        });
        // Clear any stored demo session
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } else if (event === 'SIGNED_OUT') {
        setSessionState({
          mode: 'none',
          demoProfileId: null,
          user: null,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setDemoMode = (profileId: string) => {
    const newSession: StoredSession = {
      mode: 'demo',
      demoProfileId: profileId,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    
    setSessionState({
      mode: 'demo',
      demoProfileId: profileId,
      user: null,
      isLoading: false,
    });
  };

  const clearSession = async () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Also sign out from Supabase if authenticated
    if (sessionState.mode === 'auth') {
      await supabase.auth.signOut();
    }
    
    setSessionState({
      mode: 'none',
      demoProfileId: null,
      user: null,
      isLoading: false,
    });
  };

  const exitDemo = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionState({
      mode: 'none',
      demoProfileId: null,
      user: null,
      isLoading: false,
    });
  };

  const value: SessionContextType = {
    ...sessionState,
    setDemoMode,
    clearSession,
    exitDemo,
    isDemo: sessionState.mode === 'demo',
    isAuthenticated: sessionState.mode === 'auth',
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
