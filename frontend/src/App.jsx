import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkspaceView from './pages/WorkspaceView';
import DocumentEditor from './pages/DocumentEditor';
import PublicDocumentView from './pages/PublicDocumentView';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-container container"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public/:id" element={<PublicDocumentView />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/workspace/:id" 
            element={
              <PrivateRoute>
                <WorkspaceView />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/document/:id" 
            element={
              <PrivateRoute>
                <DocumentEditor />
              </PrivateRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
