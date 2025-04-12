import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// List of allowed email domains or specific email addresses
const ALLOWED_USERS = process.env.REACT_APP_ALLOWED_USERS ? 
  process.env.REACT_APP_ALLOWED_USERS.split(',') : [];
const ALLOWED_DOMAINS = process.env.REACT_APP_ALLOWED_DOMAINS ? 
  process.env.REACT_APP_ALLOWED_DOMAINS.split(',') : [];

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user, logout } = useAuth0();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const emailDomain = user.email.split('@')[1];
      const isAllowedUser = ALLOWED_USERS.includes(user.email);
      const isAllowedDomain = ALLOWED_DOMAINS.some(domain => emailDomain === domain);
      
      setIsAuthorized(isAllowedUser || isAllowedDomain);
      
      // If user is not authorized, log them out
      if (!isAllowedUser && !isAllowedDomain) {
        logout({ logoutParams: { returnTo: window.location.origin } });
      }
    }
  }, [user, logout]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-600">You are not authorized to access this application.</p>
          <p className="text-gray-600">Please contact the administrator if you believe this is a mistake.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 