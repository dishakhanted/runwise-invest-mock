import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';

/**
 * DemoOnlyRedirect Component
 * Redirects users away from non-demo endpoints to /demo-login
 * This component is used in demo-only branches to block access to /login, /signup, /auth
 */
const DemoOnlyRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to demo-login after a brief delay to show the message
    const timer = setTimeout(() => {
      navigate('/demo-login', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <Logo className="h-24 w-24 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Demo Mode Only</h1>
          <p className="text-muted-foreground">
            This endpoint is not available in demo mode. Redirecting to demo login...
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoOnlyRedirect;

