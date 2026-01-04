/**
 * Session Context for authenticated users
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface SessionState {
  user: User | null;
  isLoading: boolean;
}

interface SessionContextType extends SessionState {
  clearSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    logger.session('Initializing session context');

    const initializeAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('Error getting Supabase session', { error: error.message }, error as Error);
      }

      if (session?.user) {
        logger.session('Supabase auth session found', { userId: session.user.id, email: session.user.email });
        setSessionState({
          user: session.user,
          isLoading: false,
        });
      } else {
        logger.session('No Supabase auth session found');
        setSessionState({
          user: null,
          isLoading: false,
        });
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.session('Auth state change event', { event, hasSession: !!session, hasUser: !!session?.user });

      if (session?.user) {
        logger.session('User authenticated via state change', { userId: session.user.id, email: session.user.email });
        setSessionState({
          user: session.user,
          isLoading: false,
        });
      } else if (event === 'SIGNED_OUT') {
        logger.session('User signed out');
        setSessionState({
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

  const clearSession = async () => {
    logger.session('Clearing session');

    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error('Error signing out from Supabase', { error: error.message }, error as Error);
    } else {
      logger.auth('Successfully signed out from Supabase');
    }

    setSessionState({
      user: null,
      isLoading: false,
    });

    logger.session('Session cleared');
  };

  const value: SessionContextType = {
    ...sessionState,
    clearSession,
    isAuthenticated: !!sessionState.user,
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
