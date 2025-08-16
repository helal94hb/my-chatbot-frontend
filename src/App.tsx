import React from 'react';
import type { FC, ReactNode } from 'react'; // Import ReactNode
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your page components
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage'; 
import ChatApp from './components/ChatApp'; // Your main chat UI component

// A simple check for authentication (replace with your actual auth logic)
const isAuthenticated = (): boolean => {
  return localStorage.getItem('userToken') !== null;
};

// --- KEY CHANGE: Define props for ProtectedRoute ---
interface ProtectedRouteProps {
  children: ReactNode;
}

// --- KEY CHANGE: Type the component and its props ---
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>; // Render children if authenticated
};

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignUpPage />} /> 
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatApp />
            </ProtectedRoute>
          } 
        />
        {/* A catch-all route to redirect to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;