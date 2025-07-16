import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupFlow from './components/SignupFlow';
import MainApp from './components/MainApp';
import { Organization } from './types';

interface AppState {
  currentUser: Organization | null;
  userType: 'nonprofit' | 'forprofit' | null;
  isAuthenticated: boolean;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    userType: null,
    isAuthenticated: false
  });

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('ngo-marketplace-user');
    const savedUserType = localStorage.getItem('ngo-marketplace-usertype');
    
    if (savedUser && savedUserType) {
      setAppState({
        currentUser: JSON.parse(savedUser),
        userType: savedUserType as 'nonprofit' | 'forprofit',
        isAuthenticated: true
      });
    }
  }, []);

  const handleLogin = (user: Organization, userType: 'nonprofit' | 'forprofit') => {
    setAppState({
      currentUser: user,
      userType,
      isAuthenticated: true
    });
    
    // Save to localStorage
    localStorage.setItem('ngo-marketplace-user', JSON.stringify(user));
    localStorage.setItem('ngo-marketplace-usertype', userType);
  };

  const handleLogout = () => {
    setAppState({
      currentUser: null,
      userType: null,
      isAuthenticated: false
    });
    
    // Clear localStorage
    localStorage.removeItem('ngo-marketplace-user');
    localStorage.removeItem('ngo-marketplace-usertype');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/signup" 
            element={
              !appState.isAuthenticated ? (
                <SignupFlow onLogin={handleLogin} />
              ) : (
                <Navigate to="/app" replace />
              )
            } 
          />
          <Route 
            path="/app" 
            element={
              appState.isAuthenticated && appState.currentUser && appState.userType ? (
                <MainApp 
                  currentUser={appState.currentUser}
                  userType={appState.userType}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/signup" replace />
              )
            } 
          />
          <Route path="/" element={<Navigate to="/signup" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 