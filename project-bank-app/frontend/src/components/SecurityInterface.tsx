import React, { useState } from 'react';
import { 
  KeyRound, LayoutGrid, ShieldCheck, Smartphone, 
  CheckCircle2, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import BaseButton from './shared/BaseButton';

// 1. TİP TANIMLAMALARI
interface SecurityInterfaceProps {
  onLogout: () => void;
  onSelectService: () => void;
  user: any;
}

interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

// 2. YARDIMCI BİLEŞEN (Focus kaybını önlemek için dışarıda tanımlandı)
const PasswordInput: React.FC<PasswordInputProps> = ({ 
  placeholder, value, onChange, isVisible, onToggle 
}) => (
  <div className="relative group">
    <input 
      type={isVisible ? "text" : "password"} 
      placeholder={placeholder} 
      required
      className="w-full p-4 pr-12 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-950 placeholder-gray-400 transition-all border border-transparent focus:border-blue-200"
      value={value} 
      onChange={e => onChange(e.target.value)}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
    >
      {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
);

// 3. ANA BİLEŞEN
const SecurityInterface: React.FC<SecurityInterfaceProps> = ({ onLogout, onSelectService, user }) => {
  const [step, setStep] = useState<'form' | 'sms' | 'success'>('form');
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [smsCode, setSmsCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInitialCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // GÜVENLİK KURALI: En az 8 karakter, 1 harf, 1 rakam, 1 özel karakter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&._\-])[A-Za-z\d@$!%*?&._\-]{8,}$/;

    // Kontrol: Yeni şifre kurallara uyuyor mu?
    if (!passwordRegex.test(passwords.next)) {
      setError('Şifre en az 8 karakter olmalı; harf, rakam ve özel karakter içermelidir.');
      setLoading(false);
      return;
    }

    // Kontrol: Yeni şifreler eşleşiyor mu?
    if (passwords.next !== passwords.confirm) {
      setError('Yeni şifreler birbiriyle eşleşmiyor.');
      setLoading(false);
      return;
    }

    try {
      // Kontrol: Mevcut şifre doğruluğu (Backend)
      const response = await fetch('http://localhost:3000/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          password: passwords.current
        }),
      });

      if (response.ok) {
        setStep('sms');
      } else {
        const data = await response.json();
        // Hatalı girişte mesaj göster ve inputları temizle
        setError('Mevcut şifre yanlış girildi.');
        setPasswords({ current: '', next: '', confirm: '' });
      }
    } catch (err) {
      setError('Sunucu bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newPassword: passwords.next
        }),
      });

      if (response.ok) {
        setStep('success');
        // 4 saniye sonra otomatik logout ve login sayfasına yönlendirme
        setTimeout(() => {
          onLogout();
        }, 4000);
      } else {
        setError('Şifre güncellenirken bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucu bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-gray-200/30 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-300/50 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shadow-lg text-white font-bold">
            <KeyRound size={20} />
          </div>
          <h1 className="text-xl font-bold text-blue-950 tracking-tight">Güvenlik Ayarları</h1>
        </div>
        <BaseButton text="Geri Dön" onClick={onSelectService} variant="secondary" className="rounded-full !py-2 !px-6 text-sm" />
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-10 max-w-md w-full animate-in fade-in zoom-in duration-300">
          
          {step === 'form' && (
            <form onSubmit={handleInitialCheck} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-black text-blue-950">Şifre Değiştir</h2>
                <p className="text-gray-500 text-sm mt-1">Güvenliğiniz için bilgilerinizi doğrulayın.</p>
              </div>

              <div className="space-y-4">
                <PasswordInput 
                  placeholder="Mevcut Şifre" 
                  value={passwords.current} 
                  onChange={(val) => setPasswords(p => ({...p, current: val}))}
                  isVisible={showPasswords.current}
                  onToggle={() => toggleVisibility('current')}
                />
                <PasswordInput 
                  placeholder="Yeni Şifre" 
                  value={passwords.next} 
                  onChange={(val) => setPasswords(p => ({...p, next: val}))}
                  isVisible={showPasswords.next}
                  onToggle={() => toggleVisibility('next')}
                />
                <PasswordInput 
                  placeholder="Yeni Şifre (Tekrar)" 
                  value={passwords.confirm} 
                  onChange={(val) => setPasswords(p => ({...p, confirm: val}))}
                  isVisible={showPasswords.confirm}
                  onToggle={() => toggleVisibility('confirm')}
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <BaseButton 
                text={loading ? "Kontrol Ediliyor..." : "Devam Et"} 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={loading} 
              />
            </form>
          )}

          {step === 'sms' && (
            <div className="text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                <Smartphone size={32} className="animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-blue-950">Doğrulama</h2>
              <p className="text-gray-500 text-sm">Cihazınıza gelen kodu giriniz (Herhangi bir kod geçerlidir).</p>
              <input 
                type="text" placeholder="0000" maxLength={4}
                className="w-full p-5 text-4xl text-center tracking-[0.5em] bg-gray-100 rounded-2xl font-black focus:ring-2 focus:ring-orange-500 outline-none text-blue-950"
                value={smsCode} onChange={e => setSmsCode(e.target.value)}
              />
              <BaseButton 
                text={loading ? "Güncelleniyor..." : "Şifreyi Güncelle"} 
                onClick={handleFinalSave} 
                variant="orange" 
                fullWidth 
                disabled={loading}
              />
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 py-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-black text-blue-950">İşlem Başarılı!</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Şifreniz başarıyla güncellendi. <br/>
                <span className="text-blue-600 font-bold">Lütfen yeni şifrenizle tekrar giriş yapın.</span>
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-4">Login sayfasına yönlendiriliyorsunuz...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SecurityInterface;