import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Consultations from './pages/Consultations';
import Remboursements from './pages/Remboursements';
import Reports from './pages/Reports';
import AdminAssureurs from './pages/AdminAssureurs';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(r => user.roles.includes(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      <Route
        path="/admin/assureurs"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminAssureurs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ASSUREUR', 'ROLE_MEDECIN']}>
            <Patients />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctors"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ASSUREUR']}>
            <Doctors />
          </ProtectedRoute>
        }
      />

      <Route
        path="/consultations"
        element={
          <ProtectedRoute allowedRoles={['ROLE_MEDECIN', 'ROLE_PATIENT']}>
            <Consultations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/remboursements"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ASSUREUR', 'ROLE_PATIENT']}>
            <Remboursements />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ASSUREUR']}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
