import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profiles from './pages/Profiles';
import Records from './pages/Records';
import RecordView from './pages/RecordView';
import UploadRecord from './pages/UploadRecord';
import Medications from './pages/Medications';
import MedicationReminder from './pages/MedicationReminder';
import MyReports from './pages/MyReports';
import MyPrescriptions from './pages/MyPrescriptions';
import RadiologyImages from './pages/RadiologyImages';
import Trackers from './pages/Trackers';
import PregnancyTracker from './pages/PregnancyTracker';
import ChildVaccinationTracker from './pages/ChildVaccinationTracker';
import RecommendedTests from './pages/RecommendedTests';
import HealthInsights from './pages/HealthInsights';
import ABHA from './pages/ABHA';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import Profile from './pages/Profile';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="profiles" element={<Profiles />} />
        <Route path="records" element={<Records />} />
        <Route path="records/reports" element={<MyReports />} />
        <Route path="records/prescriptions" element={<MyPrescriptions />} />
        <Route path="records/radiology" element={<RadiologyImages />} />
        <Route path="records/:id" element={<RecordView />} />
        <Route path="upload" element={<UploadRecord />} />
        <Route path="medications" element={<Medications />} />
        <Route path="medication-reminder" element={<MedicationReminder />} />
        <Route path="abha" element={<ABHA />} />
        <Route path="communities" element={<Communities />} />
        <Route path="communities/:communityId" element={<CommunityDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="trackers" element={<Trackers />} />
        <Route path="trackers/pregnancy" element={<PregnancyTracker />} />
        <Route path="trackers/child-vaccination" element={<ChildVaccinationTracker />} />
        <Route path="tests" element={<RecommendedTests />} />
        <Route path="insights" element={<HealthInsights />} />
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
