/**
 * Session Context for managing auth vs demo mode
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

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
    logger.session('Initializing session context');
    
    const loadStoredSession = () => {
      try {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          const parsed: StoredSession = JSON.parse(stored);
          logger.session('Found stored session', { mode: parsed.mode, demoProfileId: parsed.demoProfileId });
          
          if (parsed.mode === 'demo' && parsed.demoProfileId) {
            setSessionState(prev => ({
              ...prev,
              mode: 'demo',
              demoProfileId: parsed.demoProfileId,
              isLoading: false,
            }));
            logger.session('Demo session loaded', { demoProfileId: parsed.demoProfileId });
            return true;
          }
        } else {
          logger.debug('No stored session found');
        }
      } catch (e) {
        logger.error('Error loading stored session', { error: e }, e instanceof Error ? e : undefined);
      }
      return false;
    };

    const initializeAuth = async () => {
      logger.session('Initializing authentication');
      
      // Check for demo session first
      const isDemoSession = loadStoredSession();
      
      if (!isDemoSession) {
        logger.session('No demo session, checking Supabase auth');
        
        // Check for Supabase auth session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Error getting Supabase session', { error: error.message }, error as Error);
        }
        
        if (session?.user) {
          logger.session('Supabase auth session found', { userId: session.user.id, email: session.user.email });
          setSessionState({
            mode: 'auth',
            demoProfileId: null,
            user: session.user,
            isLoading: false,
          });
        } else {
          logger.session('No Supabase auth session found');
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
      logger.session('Auth state change event', { event, hasSession: !!session, hasUser: !!session?.user });
      
      // Don't override demo mode
      if (sessionState.mode === 'demo') {
        logger.debug('Ignoring auth state change - in demo mode');
        return;
      }

      if (session?.user) {
        logger.session('User authenticated via state change', { userId: session.user.id, email: session.user.email });
        setSessionState({
          mode: 'auth',
          demoProfileId: null,
          user: session.user,
          isLoading: false,
        });
        // Clear any stored demo session
        localStorage.removeItem(SESSION_STORAGE_KEY);
        logger.debug('Cleared demo session from localStorage');
      } else if (event === 'SIGNED_OUT') {
        logger.session('User signed out');
        setSessionState({
          mode: 'none',
          demoProfileId: null,
          user: null,
          isLoading: false,
        });
      }
    });

    return () => {
      logger.debug('Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []);

  const setDemoMode = (profileId: string) => {
    logger.session('Setting demo mode', { profileId });
    
    const newSession: StoredSession = {
      mode: 'demo',
      demoProfileId: profileId,
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    logger.debug('Demo session saved to localStorage', { profileId });
    
    setSessionState({
      mode: 'demo',
      demoProfileId: profileId,
      user: null,
      isLoading: false,
    });
    
    logger.session('Demo mode activated', { profileId });
  };

  const clearSession = async () => {
    logger.session('Clearing session', { currentMode: sessionState.mode });
    
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Also sign out from Supabase if authenticated
    if (sessionState.mode === 'auth') {
      logger.auth('Signing out from Supabase');
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error('Error signing out from Supabase', { error: error.message }, error as Error);
      } else {
        logger.auth('Successfully signed out from Supabase');
      }
    }
    
    setSessionState({
      mode: 'none',
      demoProfileId: null,
      user: null,
      isLoading: false,
    });
    
    logger.session('Session cleared');
  };

  const exitDemo = () => {
    logger.session('Exiting demo mode');
    
    localStorage.removeItem(SESSION_STORAGE_KEY);
    logger.debug('Demo session removed from localStorage');
    
    setSessionState({
      mode: 'none',
      demoProfileId: null,
      user: null,
      isLoading: false,
    });
    
    logger.session('Demo mode exited');
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
