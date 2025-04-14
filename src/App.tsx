import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Auth0ProviderWithNavigate } from './components/Auth0Provider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SnackbarProvider } from 'notistack';

// Layout Components
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import WillCreator from './pages/WillCreator';
import TrustCreator from './pages/TrustCreator';
import PowerOfAttorney from './pages/PowerOfAttorney';
import LivingWill from './pages/LivingWill';
import Documents from './pages/Documents';
import Login from './pages/Login';
import GetStarted from './pages/GetStarted';
import Assets from './pages/Assets';
import Liabilities from './pages/Liabilities';
import People from './pages/People';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Auth0ProviderWithNavigate>
          <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="get-started" element={<GetStarted />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="assets" element={<Assets />} />
                <Route path="liabilities" element={<Liabilities />} />
                <Route path="people" element={<People />} />
                <Route path="profile" element={<Profile />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="documents" element={<Documents />} />
                <Route path="will/create" element={<WillCreator />} />
                <Route path="trust/create" element={<TrustCreator />} />
                <Route path="poa/create" element={<PowerOfAttorney />} />
                <Route path="living-will/create" element={<LivingWill />} />
              </Route>
            </Routes>
          </SnackbarProvider>
        </Auth0ProviderWithNavigate>
      </Router>
    </Provider>
  );
}

export default App;
