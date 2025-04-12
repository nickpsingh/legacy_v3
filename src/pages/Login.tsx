import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setLoginError(error.message);
    }
  }, [error]);

  const handleGoogleLogin = async () => {
    try {
      setLoginError(null);
      await loginWithRedirect({
        authorizationParams: {
          connection: 'google-oauth2',
          screen_hint: 'signup',
          prompt: 'select_account',
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Failed to initialize login. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Estate Planner
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure your legacy with comprehensive estate planning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loginError && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              {loginError}
            </div>
          )}
          
          <div>
            <div className="mt-1">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                />
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Authorized access only
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-500">
              This application is restricted to authorized users only.
              <br />
              Please sign in with your authorized Google account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 