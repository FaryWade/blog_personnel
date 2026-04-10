import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LoginPage, RegisterPage } from './components/auth/AuthPages';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import MyArticles from './components/articles/MyArticles';
import ArticleView from './components/articles/ArticleView';
import Friends from './components/friends/Friends';
import SearchFriends from './components/friends/SearchFriends';
import FriendRequests from './components/friends/FriendRequests';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// App shell with sidebar
function AppShell({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppShell><Dashboard /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/articles" element={
        <ProtectedRoute>
          <AppShell><MyArticles /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/articles/:id" element={
        <ProtectedRoute>
          <AppShell><ArticleView /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/friends" element={
        <ProtectedRoute>
          <AppShell><Friends /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute>
          <AppShell><SearchFriends /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/requests" element={
        <ProtectedRoute>
          <AppShell><FriendRequests /></AppShell>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
