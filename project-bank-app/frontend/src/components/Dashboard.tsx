import React, { useState } from 'react';
import {
  LogOut, BarChart3, DollarSign, CreditCard,
  RefreshCw, Send, ChevronDown, ChevronUp, LayoutGrid,
  LockKeyhole, HelpCircle, Timer, UserPlus, Crown // Hepsini tek satırda topla
} from 'lucide-react';
import { useBank } from '../contexts/BankContext';
import Button from './shared/Button';
import TransactionList from './TransactionList';
import FilterModal, { FilterCriteria } from './FilterModal';
import { SlidersHorizontal } from 'lucide-react'; // Yeni ikon

interface DashboardProps {
  onLogout: () => void;
  username: string;
  onSelectService: () => void;
  cardNumber: string;
  user: any; 
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, username, cardNumber, onSelectService, user }) => {
  const { balance, deposit, withdraw, transactions, creditCardDebt, payDebt } = useBank();
  const [amount, setAmount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal' | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [error, setError] = useState<string>('');
  const [transferCard, setTransferCard] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState('');
const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
const [activeFilters, setActiveFilters] = useState<FilterCriteria>({
  searchTerm: '', minAmount: '', maxAmount: '', type: 'all', startDate: '', endDate: ''
});
// Dashboard.tsx içindeki diğer state'lerin yanına:
const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
const [debtPayAmount, setDebtPayAmount] = useState<string>('');
// Dashboard.tsx içindeki diğer state'lerin yanına:
const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
const [pendingAction, setPendingAction] = useState<{ type: 'transaction' | 'transfer', data: any } | null>(null);
const [currentBalance, setCurrentBalance] = useState(user?.balance || 0);

// Dashboard.tsx içinde

// Para Yatırma/Çekme İşlemi
const handleTransaction = async () => { // async ekledik
  setError('');
  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    setError('Lütfen geçerli bir miktar girin');
    return;
  }

  try {
    if (transactionType === 'withdrawal' && parsedAmount > balance) {
      setError('Yetersiz bakiye');
      return;
    }

    // --- VERİTABANI GÜNCELLEME İSTEĞİ ---
    const response = await fetch('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Dashboard.tsx içinde body kısmını şöyle güncelle:
body: JSON.stringify({
  userId: user.id, // Giriş yapan kullanıcının ID'si
  type: transactionType,
  amount: parsedAmount,
  title: transactionType === 'deposit' ? 'Para Yatırma' : 'Para Çekme',
}),
    });

    if (response.ok) {
  const result = await response.json();
  setCurrentBalance(result.newBalance); // Veritabanından gelen gerçek bakiyeyi setle
  // Context'i de güncellemeye devam edebilirsin:
  if (transactionType === 'deposit') deposit(parsedAmount);
  else withdraw(parsedAmount);
}else {
      setError('Veritabanı güncellenemedi.');
    }
  } catch (err) {
    setError('Sunucu bağlantı hatası.');
  }
};

// Borç Ödeme Onayı
const confirmDebtPayment = async () => {
  const amountToPay = parseFloat(debtPayAmount);
  
  if (amountToPay > 0 && amountToPay <= balance) {
    try {
      const response = await fetch('http://localhost:3000/api/pay-debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          amount: amountToPay 
        }),
      });

      if (response.ok) {
        // BURASI EKRANI GÜNCELLEYEN KISIM
        payDebt(amountToPay); 
        setIsDebtModalOpen(false);
        setDebtPayAmount('');
        alert("Ödeme başarıyla veritabanına işlendi.");
      } else {
        alert("Sunucu ödemeyi onaylamadı.");
      }
    } catch (err) {
      alert("Sunucu hatası: Borç ödenemedi.");
    }
  } else {
    alert("Yetersiz bakiye veya geçersiz tutar.");
  }
};
// Filtreleme Mantığı
// Dashboard.tsx içinde ilgili kısmı şu şekilde güncelle:
const filteredTransactions = (transactions || []).filter(t => {
  const matchesSearch = (t.title || '').toLowerCase().includes(activeFilters.searchTerm.toLowerCase());
  const matchesType = activeFilters.type === 'all' || t.type === activeFilters.type;
  const matchesMin = activeFilters.minAmount === '' || t.amount >= parseFloat(activeFilters.minAmount);
  const matchesMax = activeFilters.maxAmount === '' || t.amount <= parseFloat(activeFilters.maxAmount);
  
  // Tarih filtresi güvenli hale getirildi
  const txDate = t.date ? new Date(t.date).getTime() : 0;
  const start = activeFilters.startDate ? new Date(activeFilters.startDate).getTime() : 0;
  const end = activeFilters.endDate ? new Date(activeFilters.endDate).getTime() : Infinity;
  // Bitiş tarihini günün sonuna çekmek için 86399999 ms ekliyoruz
  const matchesDate = txDate >= start && txDate <= (activeFilters.endDate ? end + 86399999 : Infinity);

  return matchesSearch && matchesType && matchesMin && matchesMax && matchesDate;
});
  
  const [upcomingPayments, setUpcomingPayments] = useState([
    { title: 'Elektrik Faturası', amount: 375.50 },
    { title: 'İnternet Faturası', amount: 209.99 },
    { title: 'Kredi Kartı Asgari', amount: 1280.00 },
  ]);

  // Dashboard.tsx içindeki currentBalance satırını SİL ve bakiye formatlamayı şuna çek:
const formattedBalance = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
}).format(balance); // Direkt context'ten gelen 'balance'ı kullanıyoruz

// Hızlı İşlem (Yatırma/Çekme) Tetikleyici
const triggerTransactionConfirm = () => {
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    setError('Lütfen geçerli bir miktar girin');
    return;
  }
  if (transactionType === 'withdrawal' && parsedAmount > balance) {
    setError('Yetersiz bakiye');
    return;
  }
  
  setPendingAction({ type: 'transaction', data: { amount: parsedAmount, type: transactionType } });
  setIsConfirmModalOpen(true);
};

// Hızlı Transfer Tetikleyici
const triggerTransferConfirm = () => {
  const parsedAmount = parseFloat(transferAmount);
  if (!/^\d{16}$/.test(transferCard)) {
    setTransferError('Geçerli bir 16 haneli kart numarası girin');
    return;
  }
  if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > balance) {
    setTransferError('Geçersiz tutar veya yetersiz bakiye');
    return;
  }

  setPendingAction({ type: 'transfer', data: { amount: parsedAmount, card: transferCard } });
  setIsConfirmModalOpen(true);
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
    <div 
      className="min-h-screen flex flex-col bg-white"
    >
      {/* --- Cam Efektli Modern Header --- */}
      <header className="bg-gray-200 bg-opacity-30 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-300/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-900 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-950 tracking-tight">Medbank</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-800 font-bold opacity-70">Premium Banking</p>
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
      </header>

      /* main etiketini max-w-6xl yaparak alanı genişletiyoruz */
  <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">

    <div className="mb-8 text-center animate-fade-in">
    <h2 className="text-3xl md:text-4xl font-black text-blue-950 tracking-tight">
      Merhaba, {username}!
    </h2>
    <p className="text-gray-400 font-medium mt-2">Medbank dünyasına tekrar hoş geldin.</p>
  </div>
  
  {/* --- DEVASA KART (HERO SECTION) --- */}
  <section className="mb-12 flex flex-col items-center">
    <div className="relative group perspective-2000">
      <div className="relative z-10 transform transition-all duration-500 group-hover:rotate-y-10 group-hover:scale-105">
        <img 
          src="/src/assets/credit.png" 
          alt="SeaPal Card"
          className="w-[550px] md:w-[650px] h-auto rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/30"
        />
        <div className="absolute bottom-12 left-12 text-white font-mono text-2xl md:text-xl tracking-[0.3em] drop-shadow-2xl">
          {cardNumber.replace(/\d{4}(?=.)/g, '$& ')} 
        </div>
      </div>
      <div className="absolute -inset-10 bg-blue-500/15 blur-[120px] rounded-full -z-10"></div>
    </div>
  </section>

  {/* --- YENİ: GENİŞ BAKİYE VE FİNANSAL ÖZET BLOĞU --- */}
  <section className="mb-12">
    <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl shadow-blue-900/5 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3">
        
        {/* Sol: Bakiye Gösterimi */}
        <div className="p-10 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Kullanılabilir Bakiye</p>
          <h2 className="text-5xl font-black text-blue-950 tracking-tighter">
            {formattedBalance}
          </h2>
          <div className="flex items-center mt-4 space-x-2">
            <span className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
              <ChevronUp className="w-3 h-3 mr-1" /> %2.4
            </span>
            <span className="text-gray-400 text-xs font-medium">geçen aya göre</span>
          </div>
        </div>

        {/* Orta & Sağ: Hızlı İşlem Alanı (Geniş) */}
        <div className="md:col-span-2 p-10 bg-gray-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-blue-950">Hızlı İşlemler</h3>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
              <button 
                onClick={() => setTransactionType('deposit')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${transactionType === 'deposit' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-blue-600'}`}
              >Para Yatır</button>
              <button 
                onClick={() => setTransactionType('withdrawal')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${transactionType === 'withdrawal' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-red-600'}`}
              >Para Çek</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full text-2xl font-bold bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-blue-950 placeholder:text-gray-200"
                placeholder="0.00"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₺</span>
            </div>
            <Button
              text={transactionType === 'deposit' ? 'İşlemi Onayla' : transactionType === 'withdrawal' ? 'Çekimi Onayla' : 'İşlem Seçin'}
              onClick={triggerTransactionConfirm}
              variant={transactionType === 'deposit' ? 'primary' : transactionType === 'withdrawal' ? 'danger' : 'secondary'}
              className="h-[62px] px-10 rounded-2xl shadow-lg shadow-blue-500/20 whitespace-nowrap"
             
              icon={transactionType === 'deposit' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            />
          </div>
          {error && <p className="mt-3 text-red-500 text-xs font-bold ml-2 italic">*{error}</p>}
        </div>
      </div>
    </div>
  </section>

  {/* --- ALT GRID: TRANSFER VE GEÇMİŞ --- */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    {/* Sol: Para Aktar */}
    <div className="lg:col-span-4">
      <div className="bg-blue-600 p-8 rounded-[3rem] shadow-xl shadow-blue-600/20 text-white h-full">
        <h3 className="font-bold mb-6 flex items-center text-lg">
          <Crown className="mr-3" size={24} /> Hızlı Transfer
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="16 Haneli Kart No"
            value={transferCard}
            onChange={(e) => setTransferCard(e.target.value.replace(/\D/g, '').slice(0,16))}
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition-all"
          />
          <input
            type="text"
            placeholder="Gönderilecek Miktar"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/40 outline-none focus:bg-white/20 transition-all"
          />
          <button 
            onClick={triggerTransferConfirm}
            className="w-full bg-white text-blue-600 font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
          >
            Transferi Başlat
          </button>
        </div>
      </div>
      {/* Hızlı Transfer kutusunun altı */}
<div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-white mt-6">
  <h3 className="text-lg font-bold text-blue-950 mb-4 flex items-center">
    <CreditCard className="mr-2 text-blue-600" size={20} /> Kart Borcu Öde
  </h3>
  
  <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
    <div className="flex justify-between mb-1">
  <span className="text-xs text-gray-500 font-bold">Toplam Borç:</span>
  {/* .total kısmını sildik, sadece creditCardDebt kullanıyoruz */}
  <span className="text-sm font-black text-blue-950">₺{creditCardDebt.toFixed(2)}</span>
</div>
<div className="flex justify-between">
  <span className="text-xs text-gray-500 font-bold">Asgari Tutar:</span>
  {/* Asgariyi borcun %20'si olarak hesaplayabiliriz */}
  <span className="text-sm font-bold text-red-600">₺{(creditCardDebt * 0.2).toFixed(2)}</span>
</div>
  </div>

  <div className="space-y-3">
    <input
      type="text"
      placeholder="Ödeme Tutarı"
      value={debtPayAmount}
      onChange={(e) => setDebtPayAmount(e.target.value.replace(/[^0-9.]/g, ''))}
      className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-blue-950 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
    <div className="flex gap-2">
      <button 
  onClick={() => setDebtPayAmount((creditCardDebt * 0.2).toString())} // .minPayment yerine hesaplama yaptık
  className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg hover:bg-gray-300 transition-all"
>
  Asgariyi Yaz
</button>
      <button 
        onClick={() => setIsDebtModalOpen(true)}
        className="flex-[2] bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all"
      >
        Ödeme Yap
      </button>
    </div>
  </div>
</div>
    </div>

    

    {/* Sağ: İşlem Geçmişi */}
    <div className="lg:col-span-8">
      <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-xl shadow-blue-900/5 border border-white overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
  <div>
    <h2 className="text-xl font-black text-blue-950 tracking-tight">İşlem Geçmişi</h2>
    <p className="text-xs text-gray-400 font-medium">Finansal hareketlerinizin tam dökümü</p>
  </div>
  <button 
    onClick={() => setIsFilterModalOpen(true)}
    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-600 rounded-xl font-bold text-sm transition-all shadow-sm"
  >
    <SlidersHorizontal size={16} /> Filtrele
  </button>
</div>
        <div className="p-4">
          <TransactionList transactions={showAllTransactions ? filteredTransactions : filteredTransactions.slice(0, 6)} />
          {transactions.length > 6 && (
            <button onClick={() => setShowAllTransactions(!showAllTransactions)} className="w-full py-4 text-blue-600 font-bold text-sm hover:bg-gray-50 rounded-2xl transition-all">
              {showAllTransactions ? 'Özeti Göster' : 'Tümünü Gör'}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
</main>

      <footer className="py-8 text-center text-gray-400 text-xs font-medium">
        <div className="flex justify-center space-x-6 mb-2">
          <a href="#" className="hover:text-blue-600 transition-colors">Destek</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Güvenlik</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Şartlar</a>
        </div>
        <p>© 2026 SeaPal Digital Finance. Protected by SeaPal Protocol.</p>
      </footer>
      {isFilterModalOpen && (
  <FilterModal 
    currentFilters={activeFilters}
    onClose={() => setIsFilterModalOpen(false)}
    onApply={(newFilters) => setActiveFilters(newFilters)}
  />
)}
{/* Ödeme Onay Modal */}
{isDebtModalOpen && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl text-center">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <CreditCard size={32} />
      </div>
      <h3 className="text-xl font-bold text-blue-950 mb-2">Ödeme Onayı</h3>
      <p className="text-gray-500 text-sm mb-6">
        <span className="font-bold text-blue-600">₺{debtPayAmount}</span> tutarındaki kredi kartı borç ödemesini onaylıyor musunuz?
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => setIsDebtModalOpen(false)}
          className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Vazgeç
        </button>
        <button 
          onClick={confirmDebtPayment}
          className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 shadow-lg transition-all"
        >
          Evet, Öde
        </button>
      </div>
    </div>
  </div>
)}

{isConfirmModalOpen && pendingAction && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl text-center animate-scale-in">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        {pendingAction.type === 'transfer' ? <Send size="{32}"/> : <RefreshCw size="{32}"/>}
      </div>
      <h3 className="text-xl font-bold text-blue-950 mb-2">İşlem Onayı</h3>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        <span className="font-bold text-blue-600 text-lg">₺{pendingAction.data.amount}</span> tutarındaki 
        {pendingAction.type === 'transfer' 
          ? ` transfer işlemini (${pendingAction.data.card} numaralı karta)` 
          : ` ${pendingAction.data.type === 'deposit' ? 'para yatırma' : 'para çekme'} işlemini`} onaylıyor musunuz?
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => {
            setIsConfirmModalOpen(false);
            setPendingAction(null);
          }} 
          className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Vazgeç
        </button>
        <button 
          onClick={async () => {
            if (pendingAction.type === 'transaction') {
              await handleTransaction();
            } else {
              handleTransfer();
            }
            setIsConfirmModalOpen(false);
            setPendingAction(null);
          }}
          className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          Evet, Onayla
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};



export default Dashboard;