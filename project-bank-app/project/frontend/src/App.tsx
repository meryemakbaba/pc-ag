import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ATMInterface from './components/ATMInterface';
import SelectService from './components/SelectService';
import { BankProvider } from './contexts/BankContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [currentView, setCurrentView] = useState<'select' | 'dashboard' | 'atm'>('select');

  const handleLogin = (name: string) => {
    setUsername(name);
    setIsLoggedIn(true);
    setCurrentView('select');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
  };

  const handleServiceSelect = (type: 'atm' | 'online') => {
    setCurrentView(type === 'atm' ? 'atm' : 'dashboard');
  };

  const handleBackToSelect = () => {
    setCurrentView('select');
  };

  return (
    <BankProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {currentView === 'select' && (
              <SelectService 
                onSelect={handleServiceSelect} 
                onLogout={handleLogout} 
                username={username} 
              />
            )}
            {currentView === 'dashboard' && (
              <Dashboard 
                onLogout={handleLogout} 
                username={username} 
                onSelectService={handleBackToSelect}
              />
            )}
            {currentView === 'atm' && (
              <ATMInterface 
                onLogout={handleLogout} 
                username={username}
                onSelectService={handleBackToSelect}
              />
            )}
          </>
        )}
      </div>
    </BankProvider>
  );
}

export default App;