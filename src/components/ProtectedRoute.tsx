/**
 * ProtectedRoute component for route guards
 * Redirects unauthenticated users to login
 */

import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { logger } from '@/lib/logger';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Redirect path when not authenticated
   * @default '/demo-login'
   */
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  redirectTo = '/demo-login'
}: ProtectedRouteProps) => {
  const { isLoading, isAuthenticated } = useSession();
  const location = useLocation();

  useEffect(() => {
    logger.route(location.pathname, {
      isLoading,
      isAuthenticated,
    });
  }, [location.pathname, isLoading, isAuthenticated]);

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

  if (isAuthenticated) {
    logger.route(location.pathname, {
      status: 'authenticated',
    });
    return <>{children}</>;
  }

  logger.warn('ProtectedRoute: Access denied', {
    path: location.pathname,
    isAuthenticated,
    redirectTo,
  });

  return <Navigate to={redirectTo} state={{ from: location }} replace />;
};

