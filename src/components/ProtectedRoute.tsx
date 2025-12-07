/**
 * ProtectedRoute component for route guards
 * Redirects unauthenticated users to login/demo-login
 */

import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { logger } from '@/lib/logger';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * If true, allows demo mode access
   * If false, requires authenticated (non-demo) access
   * @default true
   */
  allowDemo?: boolean;
  /**
   * Redirect path when not authenticated
   * @default '/auth'
   */
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowDemo = true,
  redirectTo = '/auth'
}: ProtectedRouteProps) => {
  const { mode, isLoading, isAuthenticated, isDemo } = useSession();
  const location = useLocation();

  useEffect(() => {
    logger.route(location.pathname, {
      mode,
      isLoading,
      isAuthenticated,
      isDemo,
      allowDemo,
    });
  }, [location.pathname, mode, isLoading, isAuthenticated, isDemo, allowDemo]);

  // Show loading state while session is initializing
  if (isLoading) {
    logger.debug('ProtectedRoute: Loading session state', {
      path: location.pathname,
    });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated (auth mode)
  if (isAuthenticated) {
    logger.route(location.pathname, {
      status: 'authenticated',
      mode: 'auth',
    });
    return <>{children}</>;
  }

  // Check if demo mode is allowed and user is in demo mode
  if (allowDemo && isDemo) {
    logger.route(location.pathname, {
      status: 'demo_allowed',
      mode: 'demo',
    });
    return <>{children}</>;
  }

  // Not authenticated and demo not allowed (or not in demo mode)
  logger.warn('ProtectedRoute: Access denied', {
    path: location.pathname,
    mode,
    isAuthenticated,
    isDemo,
    allowDemo,
    redirectTo,
  });

  // Redirect to appropriate login page
  const loginPath = allowDemo ? '/demo-login' : redirectTo;
  
  return <Navigate to={loginPath} state={{ from: location }} replace />;
};

