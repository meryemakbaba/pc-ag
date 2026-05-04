import React, { useState, useEffect } from 'react';
import { LogOut, DollarSign, ChevronDown, ChevronUp, CreditCard, Plus, LayoutGrid } from 'lucide-react';
import { useBank } from '../contexts/BankContext';
import Button from './shared/Button';

interface ATMInterfaceProps {
  onLogout: () => void;
  username: string;
  onSelectService: () => void;
  user?: any;
}

const ATMInterface: React.FC<ATMInterfaceProps> = ({ onLogout, username, onSelectService, user }) => {
  const {
    balance,
    creditCardDebt,
    deposit,
    withdraw,
    payDebt,
    setInitialData,
  } = useBank();

  // Kullanıcı değişince DB'den bakiye ve borcu çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/transactions/${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setInitialData(data.balance, data.creditDebt, data.transactions);
        }
      } catch (err) {
        console.error('ATM: veri çekilemedi', err);
      }
    };
    if (user?.id) fetchData();
  }, [user?.id]);

  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'none' | 'withdraw' | 'deposit' | 'debt'>('none');


  const toggleSection = (section: typeof activeSection) => {
    setError('');
    setSuccess('');
    setAmount('');
    setActiveSection((prev) => (prev === section ? 'none' : section));
  };

  const predefinedAmounts = [20, 50, 100, 200, 500, 1000];




  const handleTransaction = async (
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

    if (type === 'debt') {
      if (transactionAmount > balance) {
        setError('Yeterli bakiyeniz yok');
        return;
      }
      if (transactionAmount > creditCardDebt) {
        setError('Borç tutarından fazla ödeme yapamazsınız');
        return;
      }
    }

    if (type === 'increaseDebt') {
      setSuccess(`Borç bilgisi güncellendi`);
      setAmount('');
      return;
    }

    let apiTitle = type === 'deposit' ? 'Para Yatırma (ATM)' : type === 'withdrawal' ? 'Para Çekme (ATM)' : 'Borç Ödeme (ATM)';

    try {
      if (type === 'debt') {
        const response = await fetch('http://localhost:3000/api/pay-debt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, amount: transactionAmount }),
        });
        if (response.ok) {
          const data = await response.json();
          payDebt(transactionAmount, data.newCreditDebt);
          setSuccess(`Kredi kartı borcu ödendi: ${transactionAmount} ₺`);
        } else {
          const err = await response.json();
          setError(err.error || 'İşlem sunucu tarafından onaylanmadı.');
        }
      } else {
        const apiType = type.toUpperCase();
        const response = await fetch('http://localhost:3000/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, type: apiType, amount: transactionAmount, title: apiTitle }),
        });
        if (response.ok) {
          if (type === 'deposit') {
            deposit(transactionAmount);
            setSuccess(`Başarılı şekilde bakiye yatırıldı: ${transactionAmount} ₺`);
          } else {
            withdraw(transactionAmount);
            setSuccess(`Başarılı şekilde bakiye çekildi: ${transactionAmount} ₺`);
          }
        } else {
          setError('İşlem sunucu tarafından onaylanmadı.');
        }
      }
    } catch (err) {
      setError('Sunucu bağlantı hatası.');
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
  }).format(creditCardDebt);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-gray-200 bg-opacity-30 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-300/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-950 tracking-tight">ATM Servisi</h1>
                <p className="text-[10px] uppercase tracking-widest text-blue-800 font-bold opacity-70">Hoşgeldiniz, {username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                text="Hizmet Seç"
                onClick={onSelectService}
                variant="secondary"
                icon={<LayoutGrid size={16} />}
                className="rounded-full shadow-sm"
              />
              <button
                onClick={onLogout}
                className="p-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Güncel Bakiye */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl shadow-blue-900/5 overflow-hidden">
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Güncel Bakiye</p>
              <h2 className="text-6xl font-black text-blue-950 tracking-tighter">
                {formattedBalance}
              </h2>
            </div>
          </div>

          {/* İşlem Butonları */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button text="Para Çek" onClick={() => toggleSection('withdraw')} icon={<ChevronDown size={16} />} />
            <Button text="Para Yatır" onClick={() => toggleSection('deposit')} icon={<ChevronUp size={16} />} />
            <Button text="Borç Öde" onClick={() => toggleSection('debt')} icon={<CreditCard size={16} />} />
          </div>

          {/* Para Çekme / Yatırma */}
          {(activeSection === 'withdraw' || activeSection === 'deposit') && (
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-white mx-auto max-w-2xl animate-fade-in">
              <h3 className="text-lg font-bold text-blue-950 mb-6 text-center">
                {activeSection === 'deposit' ? 'Para Yatır' : 'Para Çek'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={`${activeSection}-${amt}`}
                    onClick={() =>
                      handleTransaction(activeSection === 'deposit' ? 'deposit' : 'withdrawal', amt)
                    }
                    className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-center space-x-2 font-bold shadow-sm hover:shadow-md
                      ${activeSection === 'deposit'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:scale-[1.02]'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:scale-[1.02]'}`}
                  >
                    {activeSection === 'deposit' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    <span>{amt} ₺</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Farklı Tutar Giriniz"
                  className="w-full md:flex-1 p-4 rounded-2xl bg-gray-50 border-none text-blue-950 font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  onClick={() => handleTransaction(activeSection === 'deposit' ? 'deposit' : 'withdrawal', Number(amount))}
                  className="w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  Onayla
                </button>
              </div>
            </div>
          )}

          {/* Borç Ödeme */}
          {activeSection === 'debt' && (
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-white mx-auto max-w-2xl animate-fade-in">
               <h3 className="text-lg font-bold text-blue-950 mb-6 text-center flex items-center justify-center">
                 <CreditCard className="mr-2 text-blue-600" size={20} /> Borç Öde
               </h3>
              <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Kalan Borcunuz</p>
                <p className="text-3xl font-black text-blue-950">{formattedDebt}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {predefinedAmounts.map((amt) => (
                  <button
                    key={`debt-${amt}`}
                    onClick={() => handleTransaction('debt', amt)}
                    className="p-4 rounded-2xl border transition-all duration-200 flex items-center justify-center space-x-2 font-bold shadow-sm hover:shadow-md
                      bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:scale-[1.02]"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>{amt} ₺</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Farklı Tutar Giriniz"
                  className="w-full md:flex-1 p-4 rounded-2xl bg-gray-50 border-none text-blue-950 font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  onClick={() => handleTransaction('debt', Number(amount))}
                  className="w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  Onayla
                </button>
              </div>
            </div>
          )}

          {/* Hata ve Başarı Mesajları */}
          {(error || success) && (
            <div className="mx-auto max-w-2xl transition-all duration-300 animate-fade-in">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-4 font-bold text-center shadow-sm">
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 font-bold text-center shadow-sm">
                  <p>{success}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-gray-400 text-xs font-medium">
        <p>© 2026 Medbank Digital Finance</p>
        <p className="mt-2"></p>
      </footer>
    </div>
  );
};

export default ATMInterface;