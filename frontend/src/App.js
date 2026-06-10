import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';

function App() {
  const { user, checkAuth } = useAuthStore();
  const publicPaths = ['/login', '/signup'];

  useEffect(() => {
    if (!publicPaths.includes(window.location.pathname)) {
      checkAuth();
    }
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
