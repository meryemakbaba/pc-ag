import React, { useState, useEffect } from 'react';
import {
  LogOut, BarChart3, DollarSign, CreditCard,
  RefreshCw, Send, ChevronDown, ChevronUp, LayoutGrid,
  LockKeyhole, HelpCircle, Timer, UserPlus, Crown,
  ArrowUpCircle, ArrowDownCircle,
  Zap, Phone, KeyRound,  // Yeni eklenenler
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
  onSelectDeposit: () => void;  // EKLE
  onSelectWithdraw: () => void; // EKLE
  onSelectDebt: () => void;
  onSelectCashAdvance: () => void;
  onSelectSecurity: () => void;
  onSelectSupport: () => void;
  cardNumber: string;
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onLogout, 
  username, 
  onSelectService, 
  onSelectDeposit,  
  onSelectWithdraw, 
  onSelectDebt,     
  onSelectCashAdvance,
  onSelectSupport,
  onSelectSecurity,
  cardNumber, 
  user 
}) => {
  const { balance, deposit, withdraw, transactions, creditCardDebt, payDebt, setInitialData } = useBank();
  
  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/transactions/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Backend'den gelen veri yapısını konsolda kontrol et:
        console.log("Gelen Veri:", data);

        // setInitialData fonksiyonuna verileri gönder
        // Backend'den gelen objede borç 'creditDebt' olarak geliyorsa:
        setInitialData(data.balance, data.creditDebt, data.transactions);
      }
    } catch (err) {
      console.error("İşlem geçmişi ve borç bilgisi çekilemedi", err);
    }
  };
  if (user?.id) {
    fetchData();
  }
}, [user?.id]);

  const [showAllTransactions, setShowAllTransactions] = useState(false);
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
  const [pendingAction, setPendingAction] = useState<{ type: 'transfer', data: any } | null>(null);
  const [currentBalance, setCurrentBalance] = useState(user?.balance || 0);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);

  const serviceActions = [
    { label: 'Para Yatır', icon: <ArrowDownCircle size={16} />, type: 'atm' },
    { label: 'Para Çek', icon: <ArrowUpCircle size={16} />, type: 'atm' },
    { label: 'Bakiye Sorgu', icon: <RefreshCw size={16} />, type: 'atm' },
    { label: 'Kredi İşlemleri', icon: <CreditCard size={16} />, type: 'atm' },
  ];

  // Dashboard.tsx içinde

  // Borç Ödeme Onayı
  const confirmDebtPayment = async () => {
    const amountToPay = parseFloat(debtPayAmount);

    if (isNaN(amountToPay) || amountToPay <= 0) {
      alert("Geçerli bir tutar giriniz.");
      return;
    }
    if (amountToPay > balance) {
      alert("Yetersiz bakiye.");
      return;
    }
    if (amountToPay > creditCardDebt) {
      alert("Borç tutarından fazla ödeme yapılamaz.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/pay-debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount: amountToPay }),
      });

      if (response.ok) {
        const data = await response.json();
        // DB'den gelen yeni borcu context'e gönder
        payDebt(amountToPay, data.newCreditDebt);
        setIsDebtModalOpen(false);
        setDebtPayAmount('');
        alert("Borç ödemesi başarıyla gerçekleştirildi.");
      } else {
        const err = await response.json();
        alert(err.error || "Sunucu ödemeyi onaylamadı.");
      }
    } catch (err) {
      alert("Sunucu hatası: Borç ödenemedi.");
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
  }).format(balance || 0); // Direkt context'ten gelen 'balance'ı kullanıyoruz

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

const handleTransfer = async () => {
  setTransferError(''); // Önceki hatayı temizle
  const parsedAmount = parseFloat(transferAmount);

  try {
    const response = await fetch('http://localhost:3000/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderUserId: user.id,
        receiverCardNumber: transferCard,
        amount: parsedAmount,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      withdraw(parsedAmount);
      setCurrentBalance(data.newBalance);
      setTransferCard('');
      setTransferAmount('');
      setIsConfirmModalOpen(false); // Başarılıysa kapat
      alert(`Transfer başarıyla gerçekleştirildi.`);
    } else {
      // HATA VARSA: Modalı kapatma, sadece hata mesajını göster
      setTransferError(data.error || 'İşlem gerçekleştirilemedi.');
    }
  } catch (err) {
    setTransferError('Sunucu bağlantı hatası.');
  }
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

          {/* 4. "Hizmet Seç" Butonu ve Dropdown Menüsü */}
          <div className="flex items-center space-x-4 relative">
            

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
                alt="Medbank Card"
                className="w-[550px] md:w-[650px] h-auto rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/30"
              />
              <div className="absolute bottom-12 left-12 text-white font-mono text-2xl md:text-xl tracking-[0.3em] drop-shadow-2xl">
                {cardNumber ? cardNumber.slice(0, 16).replace(/\d{4}(?=.)/g, '$& ') : "0000 0000 0000 0000"}
              </div>
            </div>
            <div className="absolute -inset-10 bg-blue-500/15 blur-[120px] rounded-full -z-10"></div>
          </div>
        </section>

        {/* --- YENİ: GENİŞ BAKİYE VE FİNANSAL ÖZET BLOĞU --- */}
        <section className="mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl shadow-blue-900/5 overflow-hidden">
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Kullanılabilir Bakiye</p>
              <h2 className="text-6xl font-black text-blue-950 tracking-tighter">
                {formattedBalance}
              </h2>
              <div className="flex items-center mt-6 space-x-2">
                <span className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                  <ChevronUp className="w-4 h-4 mr-1" /> %2.4
                </span>
                <span className="text-gray-400 text-sm font-medium">geçen aya göre</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">

          {/* --- YENİ: ATM HIZLI İŞLEMLER PANELİ --- */}
    <div className="bg-gray-50 border-b border-gray-200 py-8 animate-fade-in">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <LayoutGrid size={20} />
          </div>
          <h3 className="text-xl font-black text-blue-950 tracking-tight underline decoration-blue-500/30 decoration-4 underline-offset-4">
            ATM Hızlı İşlemler
          </h3>
        </div>

        {/* 2'li Grid Yapısı - Toplam 6 Buton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <Button 
            text="Para Çekme" 
            onClick={onSelectWithdraw} 
            variant="primary" 
            icon={<ArrowUpCircle size={20} />}
            className="shadow-md"
          />
          <Button 
    text="Para Yatırma" 
    onClick={onSelectDeposit}  // onSelectService yerine bunu yaz
    variant="primary" 
    icon={<ArrowDownCircle size={20} />}
  />
          <Button 
            text="Borç Ödeme" 
            onClick={() => onSelectDebt()} 
            variant="primary" 
            icon={<CreditCard size={20} />}
            className="shadow-md"
          />
          <Button 
            text="Nakit Avans" 
            onClick={onSelectCashAdvance}
            variant="primary" 
            icon={<Zap size={20} />}
            className="shadow-md"
          />
          <Button 
            text="Bilgi & Şifre İşlemleri" 
            onClick={onSelectSecurity}
            variant="primary" 
            icon={<KeyRound size={20} />}
            className="shadow-md"
          />
          <Button 
            text="İletişim & Destek" 
            onClick={() => onSelectSupport()} 
            variant="primary" 
            icon={<Phone size={20} />}
            className="shadow-md"
          />
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
                  onChange={(e) => setTransferCard(e.target.value.replace(/\D/g, '').slice(0, 16))}
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

{/* HATA MESAJI BURAYA GELECEK: */}
{transferError && (
  <p className="text-red-200 text-xs mt-3 font-bold italic animate-pulse bg-red-900/20 p-2 rounded-lg border border-red-500/30">
    *{transferError}
  </p>
)}
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
                  <span className="text-sm font-black text-blue-950">₺{(creditCardDebt || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
  <span className="text-xs text-gray-500 font-bold">Asgari Tutar:</span>
  {/* Burayı (creditCardDebt * 0.2) olacak şekilde güncelliyoruz */}
  <span className="text-sm font-bold text-red-600">
    ₺{((creditCardDebt || 0) * 0.2).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
  </span>
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
        <p>© 2026 Medbank Digital Finance.</p>
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

      {/* Onay Modalı Kısmı */}
{isConfirmModalOpen && pendingAction && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl text-center animate-scale-in">
      
      {/* İkon: Hata varsa kırmızı ünlem, yoksa mavi uçak */}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${transferError ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
        {transferError ? <HelpCircle size={32} /> : <Send size={32} />}
      </div>

      <h3 className="text-xl font-bold text-blue-950 mb-2">
        {transferError ? 'Hata Oluştu' : 'İşlem Onayı'}
      </h3>

      {/* Mesaj Alanı */}
      <div className="text-gray-500 text-sm mb-6 leading-relaxed px-2">
        {transferError ? (
          <p className="text-red-600 font-bold">{transferError}</p>
        ) : (
          <p>
            <span className="font-bold text-blue-600 text-lg">₺{pendingAction.data.amount}</span> tutarındaki transfer işlemini 
            <br />({pendingAction.data.card} numaralı karta) onaylıyor musunuz?
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => {
            setIsConfirmModalOpen(false);
            setPendingAction(null);
            setTransferError(''); // Modalı kapatınca hatayı temizle
          }}
          className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600"
        >
          {transferError ? 'Kapat' : 'Vazgeç'}
        </button>
        
        {!transferError && (
          <button
            onClick={handleTransfer}
            className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 shadow-lg"
          >
            Evet, Onayla
          </button>
        )}
      </div>
    </div>
  </div>
)}


    </div>
  );
};



export default Dashboard;