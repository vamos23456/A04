import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import TeachingStudio from './components/TeachingStudio';

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLight, setIsLight] = useState(false);

  if (!hasEntered && !showAuth) {
    return (
      <LandingPage
        isLight={isLight}
        onToggleTheme={() => setIsLight((v) => !v)}
        onEnter={() => setShowAuth(true)}
      />
    );
  }

  if (showAuth && !isAuthenticated) {
    return (
      <AuthPage
        isLight={isLight}
        onToggleTheme={() => setIsLight((v) => !v)}
        onSuccess={() => {
          setIsAuthenticated(true);
          setShowAuth(false);
          setHasEntered(true);
        }}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  return <TeachingStudio />;
}
