import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Discover = React.lazy(() => import('./pages/Discover'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ExchangeHub = React.lazy(() => import('./pages/ExchangeHub'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={
                <Suspense fallback={<LoadingFallback />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="discover" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Discover />
                </Suspense>
              } />
              <Route path="profile" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Profile />
                </Suspense>
              } />
              <Route path="exchanges" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ExchangeHub />
                </Suspense>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
