import React, { useState, useEffect } from 'react';
import { LogOut, Zap, LayoutGrid, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useBank } from '../contexts/BankContext';
import Button from './shared/Button';

interface CashAdvanceProps {
  onLogout: () => void;
  username: string;
  onSelectService: () => void;
  user?: any;
}

const CashAdvanceInterface: React.FC<CashAdvanceProps> = ({ onLogout, username, onSelectService, user }) => {
  const { balance, creditCardDebt, deposit, setInitialData } = useBank();

  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<'requesting' | 'transferring'>('requesting');

  const MAX_LIMIT = 4000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/transactions/${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setInitialData(data.balance, data.creditDebt, data.transactions);
        }
      } catch (err) {
        console.error('Nakit Avans: veri çekilemedi', err);
      }
    };
    if (user?.id) fetchData();
  }, [user?.id]);

  const handleCashAdvance = async () => {
    const advanceAmount = parseFloat(amount);
    setError('');
    setSuccess('');

    if (isNaN(advanceAmount) || advanceAmount <= 0) {
      setError('Lütfen geçerli bir tutar giriniz.');
      return;
    }

    if (advanceAmount > MAX_LIMIT) {
      setError(`Maksimum nakit avans limitiniz ${MAX_LIMIT} ₺'dir.`);
      return;
    }

    setIsProcessing(true);
    setProcessStep('requesting');

    // Simülasyon: İstek oluşturuluyor ve onaylanıyor (3 saniye)
    setTimeout(async () => {
      setProcessStep('transferring');
      
      try {
        // Backend'de hem bakiye artacak hem de borç artacak özel bir endpoint olduğunu varsayıyoruz
        // Mevcut API yapına göre bakiye artışını DEPOSIT (Nakit Avans) olarak kaydediyoruz
        const response = await fetch('http://localhost:3000/api/cash-advance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            amount: advanceAmount,
            title: 'Nakit Avans İşlemi'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Context'i güncelle: Bakiye artar, Borç artar
          deposit(advanceAmount); 
          // Borç güncellemesi için context'teki payDebt fonksiyonu negatif değerle veya 
          // yeni bir setInitialData ile güncellenmelidir.
          setInitialData(data.newBalance, data.newCreditDebt, data.transactions);

          setTimeout(() => {
            setIsProcessing(false);
            setSuccess(`${advanceAmount} ₺ Nakit avans hesabınıza aktarıldı. Borç bakiyeniz güncellendi.`);
            setAmount('');
          }, 2500);
        } else {
          setIsProcessing(false);
          setError('Nakit avans talebiniz şu an gerçekleştirilemiyor.');
        }
      } catch (err) {
        setIsProcessing(false);
        setError('Sunucu bağlantı hatası.');
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* İŞLEM POP-UP */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl max-w-sm w-full text-center border border-indigo-100">
            <div className="flex justify-center mb-6">
              {processStep === 'requesting' ? (
                <div className="p-4 bg-indigo-50 rounded-full animate-pulse">
                  <Zap className="w-16 h-16 text-indigo-600" />
                </div>
              ) : (
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              )}
            </div>
            <h3 className="text-2xl font-black text-blue-950 mb-2">
              {processStep === 'requesting' ? 'Talep Alındı' : 'Aktarılıyor'}
            </h3>
            <p className="text-gray-500 font-medium">
              {processStep === 'requesting' ? 'Nakit avans isteği oluşturuldu...' : 'Para transferi gerçekleşiyor...'}
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gray-200 bg-opacity-30 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-300/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-900 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-950 tracking-tight">Nakit Avans</h1>
              <p className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold opacity-70">Acil Nakit Çözümü</p>
            </div>
          </div>
          <Button text="Ana Ekrana Dön" onClick={onSelectService} variant="secondary" className="rounded-full shadow-sm" icon={<LayoutGrid size={16} />} />
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/80 border border-white shadow-xl rounded-[2.5rem] p-8 text-center">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Mevcut Bakiyeniz</p>
            <p className="text-4xl font-black text-blue-950">₺{balance.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-white/80 border border-white shadow-xl rounded-[2.5rem] p-8 text-center">
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Güncel Borç Toplamı</p>
            <p className="text-4xl font-black text-red-600">₺{creditCardDebt.toLocaleString('tr-TR')}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-white mx-auto max-w-2xl animate-fade-in">
          <div className="flex items-start gap-4 mb-8 bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-800">
            <Info className="flex-shrink-0 mt-1" size={20} />
            <p className="text-sm leading-relaxed">
              <strong>Nakit Avans Nedir?</strong> Hesabınızda para olmasa bile limitiniz dahilinde nakit çekebilirsiniz. Çekilen tutar kredi kartı borcu olarak yansıtılır. Maksimum çekim tutarı <strong>4.000 ₺</strong>'dir.
            </p>
          </div>

          <h3 className="text-xl font-black text-blue-950 mb-6 text-center">İhtiyacınız Olan Tutarı Giriniz</h3>
          
          <div className="space-y-6">
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Örn: 2500"
                className="w-full p-6 text-2xl rounded-3xl bg-gray-50 border-none font-black text-blue-950 placeholder-gray-300 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all text-center"
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">₺</span>
            </div>

            <Button 
              text="Avans Talebi Oluştur" 
              onClick={handleCashAdvance} 
              variant="primary" 
              fullWidth
              className="py-5 rounded-3xl text-lg shadow-indigo-500/30"
              icon={<Zap size={20} />}
            />
          </div>

          {(error || success) && (
            <div className="mt-8 animate-fade-in">
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
        </div>
      </main>
    </div>
  );
};

export default CashAdvanceInterface;