import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { __setAuthFailureRedirectForTests } from './api/client';
import Login from './pages/Login';
import { Signup } from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import RecordView from './pages/RecordView';
import UploadRecord from './pages/UploadRecord';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import SmartTrack from './pages/SmartTrack';
import Layout from './components/Layout';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    __setAuthFailureRedirectForTests(() => {
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/otp" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="records" element={<Records />} />
        <Route path="records/view/:id" element={<RecordView />} />
        <Route path="records/:id" element={<RecordView />} />
        <Route path="upload" element={<UploadRecord />} />
        <Route path="profile" element={<Profile />} />
        <Route path="billing" element={<Billing />} />
        <Route path="smart-track" element={<SmartTrack />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  // Show nothing while checking auth
  if (loading) {
    return null;
  }
  
  // Check localStorage directly as fallback
  const hasToken = localStorage.getItem('access_token');
  
  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default App;
