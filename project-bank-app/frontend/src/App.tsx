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
  const [userCardNumber, setUserCardNumber] = useState<string>('');
  // App.tsx içindeki diğer state'lerin yanına ekle
const [currentUser, setCurrentUser] = useState<any>(null); // Giriş yapan kullanıcının tüm verisi burada duracak

  // handleLogin fonksiyonunu bu şekilde revize et
const handleLogin = (userObject: any) => { 
  setCurrentUser(userObject); // Kullanıcı objesini (id, firstName, balance vb.) kaydediyoruz
  setUsername(userObject.firstName);
  setUserCardNumber(userObject.cardNumber);
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
                user={currentUser}
                username={username} 
                onSelectService={handleBackToSelect}
                cardNumber={userCardNumber}
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