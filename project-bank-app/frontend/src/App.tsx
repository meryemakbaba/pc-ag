import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SelectService from './components/SelectService';
import DepositInterface from './components/DepositInterface';
import WithdrawInterface from './components/WithdrawInterface';
import CashAdvanceInterface from './components/CashAdvanceInterface'; 
import DebtPaymentInterface from './components/DebtPaymentInterface'; 
import SupportInterface from './components/SupportInterface'; 
import SecurityInterface from './components/SecurityInterface';
import { BankProvider } from './contexts/BankContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  // 1. Tipi tüm sayfaları kapsayacak şekilde güncelle
  // App.tsx içinde bu satırı bul ve şöyle değiştir:
const [currentView, setCurrentView] = useState<'dashboard' | 'deposit' | 'withdraw' | 'debt' | 'cashAdvance' | 'security' | 'support'>('dashboard');
  const [userCardNumber, setUserCardNumber] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = (userObject: any) => { 
    setCurrentUser(userObject);
    setUsername(userObject.firstName);
    setUserCardNumber(userObject.cardNumber);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCurrentUser(null);
  };

  
  // 3. Yönlendirme Fonksiyonları
  const goToDeposit = () => setCurrentView('deposit');
  const goToWithdraw = () => setCurrentView('withdraw');
  const goToDebt = () => setCurrentView('debt');

  const goToCashAdvance = () => setCurrentView('cashAdvance');
  const goToSupport = () => setCurrentView('support');
  const goToSecurity = () => setCurrentView('security');

  return (
    <BankProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            
            
            {currentView === 'dashboard' && (
              <Dashboard 
                onLogout={handleLogout} 
                user={currentUser}
                username={username} 
                onSelectService={handleLogout}
                onSelectDeposit={goToDeposit}   // Dashboard'a bağladık
                onSelectWithdraw={goToWithdraw} // Dashboard'a bağladık
                onSelectDebt={goToDebt}         // Dashboard'a bağladık
                onSelectCashAdvance={goToCashAdvance}
                onSelectSupport={goToSupport}
                onSelectSecurity={goToSecurity}
                cardNumber={userCardNumber}
              />
            )}

            {currentView === 'deposit' && (
              <DepositInterface 
                onLogout={handleLogout} 
                username={username}
                onSelectService={() => setCurrentView('dashboard')}
                user={currentUser}
              />
            )}

            {currentView === 'withdraw' && (
  <WithdrawInterface 
    onLogout={handleLogout} 
    username={username}
    onSelectService={() => setCurrentView('dashboard')} 
    user={currentUser}
  />
)}

{currentView === 'cashAdvance' && (
  <CashAdvanceInterface 
    onLogout={handleLogout} 
    username={username}
    onSelectService={() => setCurrentView('dashboard')} 
    user={currentUser}
  />
)}

{currentView === 'debt' && (
  <DebtPaymentInterface 
    onLogout={handleLogout} 
    username={username}
    onSelectService={() => setCurrentView('dashboard')} 
    user={currentUser}
  />
)}

{currentView === 'support' && (
  <SupportInterface 
    onLogout={handleLogout} 
    username={username}
    onSelectService={() => setCurrentView('dashboard')} 
  />
)}

{currentView === 'security' && (
  <SecurityInterface 
    onLogout={handleLogout} 
    onSelectService={() => setCurrentView('dashboard')} 
    user={currentUser}
  />
)}
          </>
        )}
      </div>
    </BankProvider>
  );
}

export default App;