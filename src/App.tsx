import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Layout Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

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
import Beneficiaries from './pages/Beneficiaries';
import Profile from './pages/Profile';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="get-started" element={
              <PrivateRoute>
                <GetStarted />
              </PrivateRoute>
            } />
            <Route path="dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="assets" element={
              <PrivateRoute>
                <Assets />
              </PrivateRoute>
            } />
            <Route path="liabilities" element={
              <PrivateRoute>
                <Liabilities />
              </PrivateRoute>
            } />
            <Route path="beneficiaries" element={
              <PrivateRoute>
                <Beneficiaries />
              </PrivateRoute>
            } />
            <Route path="profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="documents" element={
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            } />
            <Route path="will/create" element={
              <PrivateRoute>
                <WillCreator />
              </PrivateRoute>
            } />
            <Route path="trust/create" element={
              <PrivateRoute>
                <TrustCreator />
              </PrivateRoute>
            } />
            <Route path="poa/create" element={
              <PrivateRoute>
                <PowerOfAttorney />
              </PrivateRoute>
            } />
            <Route path="living-will/create" element={
              <PrivateRoute>
                <LivingWill />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
