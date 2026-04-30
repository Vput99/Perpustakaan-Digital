import { Routes, Route, Navigate } from 'react-router-dom';
import { SmartSchoolProvider } from './context/SmartSchoolContext';
import Login from './pages/Login';
import LibraryPage from './pages/Library';
import StudentDashboard from './pages/student/Dashboard';
import KantinDashboard from './pages/kantin/Dashboard';
import AdminView from './pages/AdminView';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <SmartSchoolProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LibraryPage />} />

        {/* Protected Student Routes */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['siswa']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Kantin Routes */}
        <Route 
          path="/kantin" 
          element={
            <ProtectedRoute allowedRoles={['kantin']}>
              <KantinDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'guru']}>
              <AdminView />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SmartSchoolProvider>
  );
}
