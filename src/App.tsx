/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import ProjectList from './components/dashboard/ProjectList';
import ProjectDetail from './components/dashboard/ProjectDetail';
import TasksPage from './components/dashboard/TasksPage';
import TeamPage from './components/dashboard/TeamPage';
import AnalyticsPage from './components/dashboard/AnalyticsPage';
import SettingsPage from './components/dashboard/SettingsPage';
import CommandPalette from './components/dashboard/CommandPalette';

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initialize]);

  return (
    <Router>
      <div className="min-h-screen bg-transparent">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="projects" element={<ProjectList />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CommandPalette />
      </div>
    </Router>
  );
}

