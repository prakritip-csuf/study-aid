import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login page, preserve attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default RequireAuth;
