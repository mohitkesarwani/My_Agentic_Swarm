import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { LoginScreen } from './screens/LoginScreen.js';
import { RegisterScreen } from './screens/RegisterScreen.js';
import { ProjectsScreen } from './screens/ProjectsScreen.js';
import { ProjectDetailScreen } from './screens/ProjectDetailScreen.js';
import { BuildDetailScreen } from './screens/BuildDetailScreen.js';
import { HealthScreen } from './screens/HealthScreen.js';

export function App() {
  return (
    <AuthProvider>
      <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/health" element={<HealthScreen />} />
          
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsScreen />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetailScreen />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/projects/:projectId/builds/:buildId"
            element={
              <ProtectedRoute>
                <BuildDetailScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}
