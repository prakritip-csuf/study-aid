import React, { createContext, useContext, useState } from 'react';
import Login from './Login';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  function login() {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  }

  function logout() {
    setIsLoggedIn(false);
  }

  function requireLogin() {
    setShowLoginModal(true);
  }

  const value = {
    isLoggedIn,
    login,
    logout,
    requireLogin,
    showLoginModal,
    setShowLoginModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Login modal removed; login now handled by /login route */}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
