import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export const Auth0ProviderWithNavigate = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_AUTH0_CALLBACK_URL || window.location.origin;

  if (!domain || !clientId) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
          <p className="text-[#989AA1]">Auth0 configuration is missing.</p>
          <p className="text-[#989AA1] mt-2">Please check your environment variables:</p>
          <ul className="mt-4 text-left">
            <li className="text-red-500">• REACT_APP_AUTH0_DOMAIN {domain ? '✓' : '✗'}</li>
            <li className="text-red-500">• REACT_APP_AUTH0_CLIENT_ID {clientId ? '✓' : '✗'}</li>
          </ul>
        </div>
      </div>
    );
  }

  const onRedirectCallback = (appState: any) => {
    navigate(appState?.returnTo || '/dashboard');
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: 'openid profile email',
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
}; 