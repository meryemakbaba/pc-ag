import React, { useState, useEffect } from 'react';
import { LogOut, ChevronDown, LayoutGrid, Banknote, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBank } from '../contexts/BankContext';
import Button from './shared/Button';

interface WithdrawInterfaceProps {
  onLogout: () => void;
  username: string;
  onSelectService: () => void;
  user?: any;
}

const WithdrawInterface: React.FC<WithdrawInterfaceProps> = ({ onLogout, username, onSelectService, user }) => {
  const { balance, withdraw, setInitialData } = useBank();

  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Pop-up yönetimi
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'withdrawing' | 'collect'>('withdrawing');

  const predefinedAmounts = [20, 50, 100, 200, 500, 1000];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/transactions/${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setInitialData(data.balance, data.creditDebt, data.transactions);
        }
      } catch (err) {
        console.error('Para Çekme: veri çekilemedi', err);
      }
    };
    if (user?.id) fetchData();
  }, [user?.id]);

  const handleWithdraw = async (transactionAmount: number) => {
    setError('');
    setSuccess('');

    if (transactionAmount <= 0 || isNaN(transactionAmount)) {
      setError('Lütfen geçerli bir tutar giriniz');
      return;
    }

    if (transactionAmount > balance) {
      setError('Yetersiz bakiye');
      return;
    }

    setIsProcessing(true);
    setProcessStep('withdrawing');

    // ATM Para Çıkış Simülasyonu (4 saniye)
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:3000/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            type: 'WITHDRAWAL',
            amount: transactionAmount,
            title: 'Para Çekme (ATM)',
          }),
        });

        if (response.ok) {
          withdraw(transactionAmount);
          setProcessStep('collect');

          // Kullanıcı "Paranızı Alın" mesajını görsün diye 3 saniye daha bekletip kapatıyoruz
          setTimeout(() => {
            setIsProcessing(false);
            setSuccess(`İşlem başarılı. Çekilen tutar: ${transactionAmount} ₺`);
            setAmount('');
          }, 3000);
          
        } else {
          setIsProcessing(false);
          setError('İşlem sunucu tarafından onaylanmadı.');
        }
      } catch (err) {
        setIsProcessing(false);
        setError('Sunucu bağlantı hatası.');
      }
    }, 4000);
  };

  const formattedBalance = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(balance || 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ATM SİMÜLASYON POP-UP */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl max-w-sm w-full text-center border border-blue-100">
            {processStep === 'withdrawing' ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Banknote className="w-24 h-24 text-blue-600 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-blue-950">Lütfen Bekleyiniz</h3>
                  <p className="text-gray-500 font-medium">Para çıkışı yapılıyor...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-20 h-20 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-blue-950">İşlem Tamamlandı</h3>
                  <p className="text-green-600 font-bold text-lg">Lütfen paranızı bölmeden alınız.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gray-200 bg-opacity-30 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-300/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center shadow-lg">
              <ChevronDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-950 tracking-tight">Para Çekme</h1>
              <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold opacity-70">Medbank ATM</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button text="Ana Ekrana Dön" onClick={onSelectService} variant="secondary" icon={<LayoutGrid size={16} />} className="rounded-full" />
            <button onClick={onLogout} className="p-2.5 rounded-full bg-red-50 text-red-600 border border-red-100 transition-colors hover:bg-red-100"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl p-12 text-center">
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Çekilebilir Bakiyeniz</p>
            <h2 className="text-6xl font-black text-blue-950 tracking-tighter">{formattedBalance}</h2>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl border border-white mx-auto max-w-2xl">
            <h3 className="text-lg font-bold text-blue-950 mb-6 text-center">Çekilecek Tutarı Seçiniz</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleWithdraw(amt)}
                  className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-bold hover:bg-red-100 transition-all flex items-center justify-center space-x-2"
                >
                  <ChevronDown className="w-5 h-5" />
                  <span>{amt} ₺</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Özel Tutar Giriniz"
                className="flex-1 p-4 rounded-2xl bg-gray-100 border-none font-bold text-blue-950 placeholder-gray-400 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <Button text="Onayla" onClick={() => handleWithdraw(Number(amount))} variant="primary" className="px-10 py-4 rounded-2xl" />
            </div>
          </div>

          {/* MESAJLAR */}
          {(error || success) && (
            <div className="mx-auto max-w-2xl animate-fade-in">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-center font-bold flex items-center justify-center gap-2">
                  <AlertCircle size={20} /> {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 text-center font-bold">
                  {success}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WithdrawInterface;