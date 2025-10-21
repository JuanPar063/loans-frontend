import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/common/protectedRoute';
import { Register } from './pages/Client/register';
// ❌ import { LoginForm } from './components/common/LoginForm';
import Login from './pages/Auth/login'; // 👈 Asegúrate que esta ruta sea correcta
import { Metrics } from './pages/Admin/metrics';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <nav>{user && <button onClick={logout}>Logout</button>}</nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/client/register" element={<Register />} />
        {/*<Route path="/client/request-loan" element={<ProtectedRoute requiredRole="client"><RequestLoan /></ProtectedRoute>} />
        <Route path="/client/balance" element={<ProtectedRoute requiredRole="client"><Balance /></ProtectedRoute>} />*/}
        <Route path="/admin/metrics" element={<ProtectedRoute requiredRole="admin"><Metrics /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
