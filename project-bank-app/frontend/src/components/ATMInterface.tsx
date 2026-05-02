import React, { useState } from 'react';
import { LogOut, DollarSign, ChevronDown, ChevronUp, CreditCard, Plus, LayoutGrid } from 'lucide-react';
import { useBank } from '../contexts/BankContext';
import Button from './shared/Button';

interface ATMInterfaceProps {
  onLogout: () => void;
  username: string;
  onSelectService: () => void;
}

const ATMInterface: React.FC<ATMInterfaceProps> = ({ onLogout, username, onSelectService }) => {
  const {
    balance,
    deposit,
    withdraw,
  } = useBank();

  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'none' | 'withdraw' | 'deposit' | 'debt'>('none');
  const [debt, setDebt] = useState<number>(1200);

  const predefinedAmounts = [20, 50, 100, 200, 500, 1000];

  const toggleSection = (section: typeof activeSection) => {
    setError('');
    setSuccess('');
    setAmount('');
    setActiveSection((prev) => (prev === section ? 'none' : section));
  };

  const handleTransaction = (
    type: 'deposit' | 'withdrawal' | 'debt' | 'increaseDebt',
    transactionAmount: number
  ) => {
    setError('');
    setSuccess('');

    if (transactionAmount <= 0) {
      setError('Lütfen geçerli bir tutar giriniz');
      return;
    }

    if (type === 'withdrawal' && transactionAmount > balance) {
      setError('Yeterli bakiyeniz yok');
      return;
    }

    if (type === 'deposit') {
      deposit(transactionAmount);
      setSuccess(`Başarılı şekilde bakiye yatırıldı: ${transactionAmount} ₺`);
    } else if (type === 'withdrawal') {
      withdraw(transactionAmount);
      setSuccess(`Başarılı şekilde bakiye çekildi: ${transactionAmount} ₺`);
    } else if (type === 'debt') {
      if (transactionAmount > balance) {
        setError('Yeterli bakiyeniz yok');
        return;
      }
      if (transactionAmount > debt) {
        setError('Borç tutarından fazla ödeme yapamazsınız');
        return;
      }
      withdraw(transactionAmount);
      setDebt((prev) => prev - transactionAmount);
      setSuccess(`Kredi kartı borcu ödendi: ${transactionAmount} ₺`);
    } else if (type === 'increaseDebt') {
      setDebt((prev) => prev + transactionAmount);
      setSuccess(`Borç artırıldı: ${transactionAmount} ₺`);
    }

    setAmount('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^-?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  const formattedBalance = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(balance);

  const formattedDebt = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(debt);

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
                <h1 className="text-xl font-bold text-white">ATM Servisi</h1>
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
                text="ATM'den Çık"
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-gray-700 shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Güncel Bakiye</h2>
            <p className="text-4xl font-bold text-white">{formattedBalance}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button text="Para Çek" onClick={() => toggleSection('withdraw')} icon={<ChevronDown size={16} />} />
            <Button text="Para Yatır" onClick={() => toggleSection('deposit')} icon={<ChevronUp size={16} />} />
            <Button text="Borç Öde" onClick={() => toggleSection('debt')} icon={<CreditCard size={16} />} />
          </div>

          {(activeSection === 'withdraw' || activeSection === 'deposit') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={`${activeSection}-${amt}`}
                    onClick={() =>
                      handleTransaction(activeSection === 'deposit' ? 'deposit' : 'withdrawal', amt)
                    }
                    className={`p-4 rounded-lg border transition-all duration-200 flex items-center justify-center space-x-2
                      ${activeSection === 'deposit'
                        ? 'bg-green-900/20 border-green-700/30 hover:bg-green-900/30'
                        : 'bg-red-900/20 border-red-700/30 hover:bg-red-900/30'}`}
                  >
                    {activeSection === 'deposit' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{amt} ₺</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Tutar giriniz"
                  className="flex-1 p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleTransaction(activeSection === 'deposit' ? 'deposit' : 'withdrawal', Number(amount))}
                  className="p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white border border-gray-400"
                >
                  İşlemi Gerçekleştir
                </button>
              </div>
            </>
          )}

          {activeSection === 'debt' && (
            <div className="space-y-4">
              <div className="bg-gray-800 bg-opacity-40 border border-blue-800/40 rounded-lg p-4">
                <h3 className="text-sm text-gray-400 mb-1">Kalan Borcunuz</h3>
                <p className="text-2xl font-semibold text-blue-300">{formattedDebt}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={`debt-${amt}`}
                    onClick={() => handleTransaction('debt', amt)}
                    className="p-4 rounded-lg border transition-all duration-200 flex items-center justify-center space-x-2
                      bg-blue-900/20 border-blue-700/30 hover:bg-blue-900/30"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{amt} ₺</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Tutar giriniz"
                  className="flex-1 p-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleTransaction('debt', Number(amount))}
                  className="p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-white border border-gray-400"
                >
                  İşlemi Gerçekleştir
                </button>
              </div>
            </div>
          )}

          {(error || success) && (
            <div className="transition-all duration-300">
              {error && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 mb-2">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                  <p className="text-green-400">{success}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 bg-opacity-30 backdrop-blur-sm border-t border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 text-sm">Arif Küçükeşmekaya, Ertuğrul Selim Öztürk, Şevval Çulcu</p>
        </div>
      </footer>
    </div>
  );
};

export default ATMInterface;