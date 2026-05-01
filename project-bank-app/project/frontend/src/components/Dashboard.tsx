import React, { useState } from 'react';
import {
  LogOut, BarChart3, DollarSign, CreditCard,
  RefreshCw, Send, ChevronDown, ChevronUp, LayoutGrid
} from 'lucide-react';
import { useBank } from '../contexts/BankContext';
import Button from './shared/Button';
import TransactionList from './TransactionList';

interface DashboardProps {
  onLogout: () => void;
  username: string;
  onSelectService: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, username, onSelectService }) => {
  const { balance, deposit, withdraw, transactions } = useBank();
  const [amount, setAmount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal' | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [error, setError] = useState<string>('');
  const [transferCard, setTransferCard] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState('');

  const [upcomingPayments, setUpcomingPayments] = useState([
    { title: 'Elektrik Faturası', amount: 375.50 },
    { title: 'İnternet Faturası', amount: 209.99 },
    { title: 'Kredi Kartı Asgari', amount: 1280.00 },
  ]);

  const formattedBalance = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(balance);

  const handleTransaction = () => {
    setError('');
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Lütfen geçerli bir miktar girin');
      return;
    }

    if (transactionType === 'withdrawal' && parsedAmount > balance) {
      setError('Yetersiz bakiye');
      return;
    }

    if (transactionType === 'deposit') {
      deposit(parsedAmount);
    } else if (transactionType === 'withdrawal') {
      withdraw(parsedAmount);
    }

    setAmount('');
    setTransactionType(null);
  };

  const handleTransfer = () => {
    setTransferError('');
    const parsedAmount = parseFloat(transferAmount);
    const cardPattern = /^\d{16}$/;

    if (!cardPattern.test(transferCard)) {
      setTransferError('Lütfen geçerli bir 16 haneli kart numarası girin');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setTransferError('Lütfen geçerli bir miktar girin');
      return;
    }

    if (parsedAmount > balance) {
      setTransferError('Yetersiz bakiye');
      return;
    }

    withdraw(parsedAmount);
    setTransferCard('');
    setTransferAmount('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    const formatted = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : value;
    setAmount(formatted);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SeaPal</h1>
                <p className="text-xs text-gray-400">Hoşgeldiniz, {username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                text="Hizmet Seç"
                onClick={onSelectService}
                variant="primary"
                icon={<LayoutGrid size={16} />}
                className="text-sm py-2 px-4"
              />
              <Button
                text="Çıkış Yap"
                onClick={onLogout}
                variant="secondary"
                icon={<LogOut size={16} />}
                className="text-sm py-2 px-4"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sol Sütun */}
          <div className="lg:col-span-1 space-y-8">

            {/* Bakiye ve Hızlı İşlem */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 shadow-xl">
              <div className="bg-gradient-to-r from-indigo-600/30 to-purple-600/30 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-300">Hesap Bakiyesi</h2>
                  <RefreshCw className="w-5 h-5 text-gray-400" />
                </div>
                <div className="bg-gradient-to-r from-indigo-800/50 to-purple-800/50 rounded-lg p-6 border border-indigo-500/20">
                  <p className="text-sm text-gray-400 mb-1">Güncel Bakiye</p>
                  <p className="text-3xl font-bold text-white mb-2">{formattedBalance}</p>
                  <div className="flex items-center text-green-400 text-sm">
                    <ChevronUp className="w-4 h-4 mr-1" />
                    <span>Son ayın %2.4'ünden</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Para Yatır / Çek</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">İşlem Tipi</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
                        transactionType === 'deposit'
                          ? 'bg-green-600/20 border-green-500 text-green-400'
                          : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setTransactionType('deposit')}
                    >
                      <ChevronUp className="w-4 h-4" />
                      <span>Para Yatır</span>
                    </button>
                    <button
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
                        transactionType === 'withdrawal'
                          ? 'bg-red-600/20 border-red-500 text-red-400'
                          : 'bg-gray-700/30 border-gray-600 text-gray-400 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setTransactionType('withdrawal')}
                    >
                      <ChevronDown className="w-4 h-4" />
                      <span>Para Çek</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Miktar</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    className="w-full pl-3 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="0.00"
                    disabled={!transactionType}
                  />
                  {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
                </div>

                <Button
                  text={
                    transactionType === 'deposit'
                      ? 'Yatırım Yap'
                      : transactionType === 'withdrawal'
                      ? 'Çekim Yap'
                      : 'İşlem Tipi Seç'
                  }
                  onClick={handleTransaction}
                  variant={
                    transactionType === 'deposit'
                      ? 'primary'
                      : transactionType === 'withdrawal'
                      ? 'danger'
                      : 'secondary'
                  }
                  fullWidth
                  icon={
                    transactionType === 'deposit'
                      ? <ChevronUp size={18} />
                      : transactionType === 'withdrawal'
                      ? <ChevronDown size={18} />
                      : <Send size={18} />
                  }
                  className={!transactionType || !amount ? 'opacity-50 cursor-not-allowed' : ''}
                />
              </div>
            </div>

            {/* Para Aktar */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Para Aktar</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Kart Numarası</label>
                <input
                  type="text"
                  value={transferCard}
                  onChange={(e) => setTransferCard(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  className="w-full pl-3 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none text-white"
                  placeholder="16 haneli kart numarası"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Miktar</label>
                <input
                  type="text"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full pl-3 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none text-white"
                  placeholder="0.00"
                />
                {transferError && <p className="mt-2 text-red-400 text-sm">{transferError}</p>}
              </div>
              <Button
                text="Gönder"
                onClick={handleTransfer}
                variant="primary"
                fullWidth
                icon={<Send size={18} />}
              />
            </div>

            {/* Yaklaşan Ödemeler */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Yaklaşan Ödemeler</h3>
              <ul className="space-y-4">
                {upcomingPayments.map((payment, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center text-sm text-gray-300 border-b border-gray-600 pb-2"
                  >
                    <div>
                      <p>{payment.title}</p>
                      <p className="text-gray-500 text-xs">₺{payment.amount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (balance >= payment.amount) {
                          withdraw(payment.amount);
                          setUpcomingPayments(prev => prev.filter((_, i) => i !== idx));
                        } else {
                          alert('Yetersiz bakiye. Ödeme gerçekleştirilemedi.');
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs"
                    >
                      Öde
                    </button>
                  </li>
                ))}
                {upcomingPayments.length === 0 && (
                  <li className="text-gray-400 text-sm text-center">Tüm ödemeler yapıldı</li>
                )}
              </ul>
            </div>
          </div>

          {/* İşlem Geçmişi */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 shadow-xl overflow-hidden h-full">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-300">İşlem Geçmişi</h2>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">Son işlemleriniz</p>
              </div>
              <div className="p-6">
                <TransactionList
                  transactions={showAllTransactions ? transactions : transactions.slice(0, 5)}
                />
                {transactions.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAllTransactions(!showAllTransactions)}
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center mx-auto"
                    >
                      {showAllTransactions ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Daha az göster
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Tüm işlemleri gör
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 bg-opacity-30 backdrop-blur-sm border-t border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-2 md:mb-0">
              © 2025 SecureBank. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Gizlilik Politikası</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Hizmet Şartları</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Destek Al</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;