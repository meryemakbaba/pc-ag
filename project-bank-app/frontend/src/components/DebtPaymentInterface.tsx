import React, { useState, useEffect } from 'react';
import { LogOut, CreditCard, LayoutGrid, Banknote, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import { useBank } from '../contexts/BankContext';
import Button from './shared/Button';

interface DebtPaymentProps {
  onLogout: () => void;
  username: string;
  onSelectService: () => void;
  user?: any;
}

const DebtPaymentInterface: React.FC<DebtPaymentProps> = ({ onLogout, username, onSelectService, user }) => {
  const { balance, creditCardDebt, payDebt, setInitialData } = useBank();

  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'verifying' | 'completed'>('verifying');

  // Veritabanından en güncel borç ve bakiye bilgisini çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/transactions/${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setInitialData(data.balance, data.creditDebt, data.transactions);
        }
      } catch (err) {
        console.error('Borç Ödeme: Veri çekilemedi', err);
      }
    };
    if (user?.id) fetchData();
  }, [user?.id]);

  const handlePayDebt = async (paymentAmount: number) => {
    setError('');
    setSuccess('');

    if (paymentAmount <= 0 || isNaN(paymentAmount)) {
      setError('Lütfen geçerli bir tutar giriniz.');
      return;
    }

    if (paymentAmount > balance) {
      setError('Yetersiz bakiye. Lütfen önce hesabınıza para yatırın.');
      return;
    }

    if (paymentAmount > creditCardDebt) {
      setError('Borç tutarından fazla ödeme yapamazsınız.');
      return;
    }

    setIsProcessing(true);
    setProcessStep('verifying');

    // ATM İşlem Simülasyonu (4 saniye)
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:3000/api/pay-debt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            amount: paymentAmount,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Context'i güncelle (Bakiyeyi düşür, borcu yeni DB değeriyle set et)
          payDebt(paymentAmount, data.newCreditDebt);
          
          setProcessStep('completed');

          setTimeout(() => {
            setIsProcessing(false);
            setSuccess(`₺${paymentAmount} tutarındaki borç ödemesi başarıyla gerçekleşti.`);
            setAmount('');
          }, 2500);
        } else {
          setIsProcessing(false);
          const errData = await response.json();
          setError(errData.error || 'İşlem sunucu tarafından reddedildi.');
        }
      } catch (err) {
        setIsProcessing(false);
        setError('Sunucu bağlantı hatası oluştu.');
      }
    }, 4000);
  };

  const formattedBalance = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(balance);
  const formattedDebt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(creditCardDebt);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ATM İŞLEM POP-UP */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl max-w-sm w-full text-center border border-blue-100">
            {processStep === 'verifying' ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <CreditCard className="w-20 h-20 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-blue-950">İşlem Yapılıyor</h3>
                  <p className="text-gray-500 font-medium mt-2">Ödeme bilgileriniz doğrulanıyor...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-blue-950">Ödeme Başarılı</h3>
                  <p className="text-green-600 font-bold">Borç bakiyeniz güncellendi.</p>
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-950 tracking-tight">Borç Ödeme</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-800 font-bold opacity-70">Medbank Kredi İşlemleri</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button text="Ana Ekrana Dön" onClick={onSelectService} variant="secondary" icon={<LayoutGrid size={16} />} className="rounded-full" />
            <button onClick={onLogout} className="p-2.5 rounded-full bg-red-50 text-red-600 border border-red-100 transition-colors hover:bg-red-100">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/80 border border-white shadow-xl rounded-[2.5rem] p-8 text-center">
            <Wallet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Hesap Bakiyeniz</p>
            <p className="text-4xl font-black text-blue-950">{formattedBalance}</p>
          </div>
          <div className="bg-white/80 border border-white shadow-xl rounded-[2.5rem] p-8 text-center">
            <CreditCard className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Toplam Kart Borcu</p>
            <p className="text-4xl font-black text-red-600">{formattedDebt}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl border border-white mx-auto max-w-2xl">
          <h3 className="text-lg font-bold text-blue-950 mb-6 text-center">Ödeme Seçenekleri</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => handlePayDebt(creditCardDebt * 0.2)}
              className="p-6 rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-xs uppercase opacity-70 mb-1">Asgari Ödeme (%20)</span>
              <span className="text-xl">₺{(creditCardDebt * 0.2).toFixed(2)}</span>
            </button>
            <button
              onClick={() => handlePayDebt(creditCardDebt)}
              className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-all flex flex-col items-center justify-center"
            >
              <span className="text-xs uppercase opacity-70 mb-1">Borcun Tamamı</span>
              <span className="text-xl">₺{creditCardDebt.toFixed(2)}</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Özel Tutar Giriniz"
              className="flex-1 p-4 rounded-2xl bg-gray-100 border-none font-bold text-blue-950 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Button text="Borcu Öde" onClick={() => handlePayDebt(Number(amount))} variant="primary" className="px-10 py-4 rounded-2xl" />
          </div>
        </div>

        {/* HATA/BAŞARI MESAJLARI */}
        {(error || success) && (
          <div className="mt-8 mx-auto max-w-2xl animate-fade-in">
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 font-bold shadow-sm">
                <AlertCircle size={20} /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 font-bold shadow-sm">
                <CheckCircle2 size={20} /> {success}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DebtPaymentInterface;