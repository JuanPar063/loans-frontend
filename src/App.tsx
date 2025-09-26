import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginForm } from './components/common/LoginForm';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Register } from './pages/Client/Register';
import { RequestLoan } from './pages/Client/RequestLoan';  // Asume import
import { Balance } from './pages/Client/Balance';
import { Metrics } from './pages/Admin/Metrics';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, logout } = useAuth();

  const handleLoginSuccess = () => {};  // Refresh user

  return (
    <Router>
      <nav>{user && <button onClick={logout}>Logout</button>}</nav>
      <Routes>
        <Route path="/login" element={<LoginForm onSuccess={handleLoginSuccess} />} />
        <Route path="/client/register" element={<Register />} />
        <Route path="/client/request-loan" element={<ProtectedRoute requiredRole="client"><RequestLoan /></ProtectedRoute>} />
        <Route path="/client/balance" element={<ProtectedRoute requiredRole="client"><Balance /></ProtectedRoute>} />
        <Route path="/admin/metrics" element={<ProtectedRoute requiredRole="admin"><Metrics /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;