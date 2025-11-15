import React from 'react';
import { useAuth } from './AuthContext';
import Login from './Login';
import { useLocation, useNavigate } from 'react-router-dom';

function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogin() {
    login();
    // Redirect to previous page if available
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  }

  return (
    <div className="container my-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <h2 className="mb-4">Please log in to continue</h2>
      <Login onLogin={handleLogin} />
    </div>
  );
}

export default LoginPage;
