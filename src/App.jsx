import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Dashboard } from './components/Dashboard/Dashboard';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/registro" element={<Register />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/registro" replace />} />
      </Routes>
    </Router>
  );
}

export default App;