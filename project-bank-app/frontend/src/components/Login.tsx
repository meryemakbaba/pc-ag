import React, { useState, useEffect } from 'react';
import { LockKeyhole, HelpCircle, Timer, UserPlus, Crown } from 'lucide-react';
import Input from './shared/Input';
import Button from './shared/Button';
import { LoginFormData, VerificationData } from '../utils/types';
import backgroundImage from '../assets/login.png';

interface LoginProps {
  onLogin: (userObject: any) => void; // 👈 İki parametre yerine tek bir obje bekliyoruz
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    cardNumber: '',
    password: '',
    email: '',
    phoneNumber: '',
    name: '',
    tcId: '',
    emailCode: '',
    phoneCode: '',
  });

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const [errors, setErrors] = useState({
    cardNumber: '',
    password: '',
    email: '',
    phoneNumber: '',
    name: '',
    tcId: '',
    emailCode: '',
    phoneCode: '',
  });

useEffect(() => {
    let timer: any; // NodeJS.Timeout yerine 'any' yazmak karmaşayı çözer
    if (verification && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [verification, timeRemaining]);

  const formatCardNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19);
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

const validateForm = (type: 'login' | 'register' | 'forgot'): boolean => {
    // 1. ADIM: Her denemede tüm hataları sıfırla
    const resetErrors = {
      cardNumber: '', password: '', email: '', phoneNumber: '',
      name: '', tcId: '', emailCode: '', phoneCode: '',
    };
    
    let currentErrors = { ...resetErrors };
    let isValid = true;

    // Şifre kuralı: En az 8 karakter, 1 harf, 1 rakam ve 1 özel karakter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&._\-])[A-Za-z\d@$!%*?&._\-]{8,}$/;

    // --- REGISTER KONTROLLERİ ---
    if (type === 'register') {
      
      // TELEFON: Sadece rakamları al ve fazlalık varsa kes
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '').slice(0, 10);
      if (phoneDigits.length !== 10) {
        currentErrors.phoneNumber = `Telefon numarası 10 haneli olmalıdır`;
        isValid = false;
      }

      // KART NUMARASI: Boşlukları ve rakam dışı karakterleri temizle
      const cardDigits = formData.cardNumber.replace(/\D/g, '');
      if (cardDigits.length !== 16) {
        currentErrors.cardNumber = `Kart numarası 16 haneli olmalıdır`;
        isValid = false;
      }

      // TC KİMLİK: 11 hane kontrolü
      const tcDigits = formData.tcId.replace(/\D/g, '').slice(0, 11);
      if (tcDigits.length !== 11) {
        currentErrors.tcId = 'TC Kimlik numarası 11 haneli olmalıdır';
        isValid = false;
      }

      // İSİM & EMAIL & ŞİFRE
      if (!formData.name.trim()) { currentErrors.name = 'Adınızı giriniz'; isValid = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { currentErrors.email = 'Geçersiz email adresi'; isValid = false; }
      if (!passwordRegex.test(formData.password)) {
        currentErrors.password = 'Şifre en az 8 karakter; harf, rakam ve özel karakter içermelidir';
        isValid = false;
      }

    } else if (type === 'login') {
      const cardDigits = formData.cardNumber.replace(/\D/g, '');
      if (cardDigits.length !== 16) {
        currentErrors.cardNumber = 'Kart numarası 16 haneli olmalıdır';
        isValid = false;
      }
      if (formData.password.length < 1) { currentErrors.password = 'Şifre boş olamaz'; isValid = false; }
    }

    setErrors(currentErrors);
    return isValid;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (validateForm('login')) {
    try {
      const rawCardNumber = formData.cardNumber.replace(/\s/g, ''); 
      
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cardNumber: rawCardNumber, 
          password: formData.password 
        })
      });

      // Veriyi BURADA bir kez çekiyoruz
      const data = await response.json();

      if (response.ok) {
        // data.user artık güvenli bir şekilde kullanılabilir
        onLogin(data.user); 
      } else {
        // Sunucudan gelen hata mesajını gösteriyoruz
        setErrors({ ...errors, password: data.error || 'Giriş başarısız' });
      }
    } catch (error) {
      // Eğer gerçekten sunucu kapalıysa buraya düşer
      alert("Sunucuya bağlanılamadı. Arka plan uygulamasının açık olduğundan emin olun.");
    }
  }
};

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verification && validateForm('register')) {
      setVerification({
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        timeRemaining: 180,
      });
      setTimeRemaining(180);
      setCanResend(false);
      alert(`Doğrulama kodları ${formData.email} ve ${formData.phoneNumber} adreslerine gönderildi`);
    } else if (verification) {
      if (formData.emailCode?.length === 6 && formData.phoneCode?.length === 6) {
        
        // --- BURADAN İTİBAREN YENİ BACKEND BAĞLANTISI EKLENDİ ---
        try {
          const rawCardNumber = formData.cardNumber.replace(/\s/g, '');
          // "Davut Dilek" gibi tek parça gelen ismi FirstName ve LastName olarak ayırıyoruz
          const nameParts = formData.name.trim().split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ') || 'Bilinmiyor';

          const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cardNumber: rawCardNumber,
              password: formData.password,
              firstName: firstName,
              lastName: lastName
            })
          });

          if (response.ok) {
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            setShowRegister(false);
            setVerification(null);
            setFormData({
              cardNumber: '', password: '', email: '', phoneNumber: '', name: '', tcId: '', emailCode: '', phoneCode: '',
            });
          } else {
            const data = await response.json();
            alert(data.error || "Kayıt sırasında bir hata oluştu.");
          }
        } catch (error) {
          alert("Sunucuya bağlanılamadı.");
        }
        // ---------------------------------------------------------

      } else {
        setErrors({
          ...errors,
          emailCode: formData.emailCode?.length !== 6 ? 'Geçersiz kod' : '',
          phoneCode: formData.phoneCode?.length !== 6 ? 'Geçersiz kod' : '',
        });
      }
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verification && validateForm('forgot')) {
      setVerification({
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        timeRemaining: 180,
      });
      setTimeRemaining(180);
      setCanResend(false);
      alert(`Doğrulama kodları ${formData.email} ve ${formData.phoneNumber} adreslerine gönderildi`);
    } else if (verification) {
      // Handle verification code submission
      if (formData.emailCode?.length === 6 && formData.phoneCode?.length === 6) {
        // Here you would typically verify the codes with your backend
        alert('Şifre sıfırlama başarılı!');
        setShowForgotPassword(false);
        setVerification(null);
        // Reset form data
        setFormData({
          cardNumber: '',
          password: '',
          email: '',
          phoneNumber: '',
          name: '',
          tcId: '',
          emailCode: '',
          phoneCode: '',
        });
      } else {
        setErrors({
          ...errors,
          emailCode: formData.emailCode?.length !== 6 ? 'Geçersiz kod' : '',
          phoneCode: formData.phoneCode?.length !== 6 ? 'Geçersiz kod' : '',
        });
      }
    }
  };

  const handleResendCode = () => {
    setTimeRemaining(180);
    setCanResend(false);
    alert(`Yeni doğrulama kodları ${verification?.email} ve ${verification?.phoneNumber} adreslerine gönderildi`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

return (
    <div 
      className="min-h-screen flex items-center p-4 md:pl-32 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* max-w-md yerine max-w-2xl kullanarak kartı sağa doğru genişlettik */}
      <div className="w-full max-w-2xl slide-up">
        <div className="bg-gray-200 bg-opacity-90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          
          {/* Header section */}
          <div className="p-6 text-center border-b border-gray-300">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 mb-3">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Medbank
            </h1>
            <p className="text-gray-500 text-sm mt-1">Güvenilir finansal partneriniz artık cebinizde</p>
          </div>

          {!showForgotPassword && !showRegister ? (
            /* Login form - Genişleyen kartla birlikte inputlar da otomatik olarak uzayacaktır */
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <Input
                  id="cardNumber"
                  label="Kart Numarası"
                  type="text"
                  value={formatCardNumber(formData.cardNumber)}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="16 haneli kart numaranızı giriniz"
                  maxLength={19}
                  required
                  error={errors.cardNumber}
                />
                
                <Input
                  id="password"
                  label="Şifre"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Şifrenizi giriniz"
                  required
                  error={errors.password}
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-900 transition-colors duration-200 font-medium"
                >
                  Şifrenizi mi unuttunuz?
                </button>
              </div>

              <div className="space-y-3">
                <Button 
                  text="Giriş Yap" 
                  onClick={() => {}} 
                  fullWidth 
                  icon={<LockKeyhole size={18} />} 
                />
                <Button 
                  text="Kayıt Ol" 
                  onClick={() => setShowRegister(true)} 
                  fullWidth 
                  variant="secondary"
                  icon={<UserPlus size={18} />} 
                />
              </div>
            </form>
          ) : showRegister ? (
            /* Register form */
            <form onSubmit={handleRegister} className="p-8 space-y-5">
              {!verification ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      id="name"
                      label="Tam Adınız"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ad Soyad"
                      required
                      error={errors.name}
                    />
                    <Input
                      id="email"
                      label="Email Adresi"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="örnek@mail.com"
                      required
                      error={errors.email}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      id="phoneNumber"
                      label="Telefon Numarası"
                      type="text"
                      value={formatPhoneNumber(formData.phoneNumber)}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="(5XX) XXX-XXXX"
                      required
                      error={errors.phoneNumber}
                    />
                    <Input
                      id="tcId"
                      label="TC Kimlik Numarası"
                      type="text"
                      maxLength={11} // 👈 Sadece 11 rakam girilebilmesi için eklendi
                      value={formData.tcId}
                      onChange={(e) => setFormData({ ...formData, tcId: e.target.value.replace(/\D/g, '') })}
                      placeholder="11 Haneli TC No"
                      required
                      error={errors.tcId}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      id="cardNumber"
                      label="Kart Numarası"
                      type="text"
                      value={formatCardNumber(formData.cardNumber)}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      placeholder="16 Haneli No"
                      maxLength={19}
                      required
                      error={errors.cardNumber}
                    />
                    <Input
                      id="password"
                      label="Şifre"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Güçlü bir şifre"
                      required
                      error={errors.password}
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      text="Kayıt İşlemini Tamamla" 
                      onClick={() => {}} 
                      fullWidth 
                      icon={<UserPlus size={18} />} 
                    />
                  </div>
                </div>
              ) : (
                /* Verification section */
                <div className="space-y-6">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">Güvenlik Doğrulaması</h3>
                    <p className="text-sm text-gray-500">Kodlar adreslerinize iletildi</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      id="emailCode"
                      label="Email Doğrulama"
                      type="text"
                      maxLength={6}
                      value={formData.emailCode || ''}
                      onChange={(e) => setFormData({ ...formData, emailCode: e.target.value.replace(/\D/g, '') })}
                      placeholder="6 Haneli Kod"
                      required
                      error={errors.emailCode}
                    />
                    <Input
                      id="phoneCode"
                      label="SMS Doğrulama"
                      type="text"
                      maxLength={6}
                      value={formData.phoneCode || ''}
                      onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value.replace(/\D/g, '') })}
                      placeholder="6 Haneli Kod"
                      required
                      error={errors.phoneCode}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Timer size={16} />
                      <span>Kalan Süre: {formatTime(timeRemaining)}</span>
                    </div>
                    {canResend && (
                      <button type="button" onClick={handleResendCode} className="text-blue-600 font-bold hover:underline">Yeni Kod Gönder</button>
                    )}
                  </div>
                  <Button text="Hesabı Doğrula" onClick={() => {}} fullWidth icon={<Crown size={18} />} />
                </div>
              )}

              <Button 
                text="Giriş Sayfasına Dön" 
                onClick={() => {
                  setShowRegister(false);
                  setVerification(null);
                }} 
                fullWidth 
                variant="secondary"
              />
            </form>
          ) : (
            /* Forgot Password form */
            <form onSubmit={handleForgotPassword} className="p-8 space-y-6">
              {!verification ? (
                <div className="space-y-4">
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Sistemde kayıtlı e-posta"
                    required
                    error={errors.email}
                  />

                  <Input
                    id="phoneNumber"
                    label="Telefon Numarası"
                    type="text"
                    value={formatPhoneNumber(formData.phoneNumber)}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="(5XX) XXX-XXXX"
                    required
                    error={errors.phoneNumber}
                  />

                  <Button 
                    text="Doğrulama Kodlarını Gönder" 
                    onClick={() => {}} 
                    fullWidth 
                    icon={<HelpCircle size={18} />} 
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      id="emailCode"
                      label="Email Kod"
                      type="text"
                      maxLength={6}
                      value={formData.emailCode || ''}
                      onChange={(e) => setFormData({ ...formData, emailCode: e.target.value.replace(/\D/g, '') })}
                      placeholder="6 Hane"
                      required
                      error={errors.emailCode}
                    />
                    <Input
                      id="phoneCode"
                      label="SMS Kod"
                      type="text"
                      maxLength={6}
                      value={formData.phoneCode || ''}
                      onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value.replace(/\D/g, '') })}
                      placeholder="6 Hane"
                      required
                      error={errors.phoneCode}
                    />
                  </div>
                  <Button text="Sıfırlama Onayla" onClick={() => {}} fullWidth icon={<Crown size={18} />} />
                </div>
              )}

              <Button 
                text="Geri Dön" 
                onClick={() => {
                  setShowForgotPassword(false);
                  setVerification(null);
                }} 
                fullWidth 
                variant="secondary"
              />
            </form>
          )}

          {/* Security note */}
          <div className="p-4 bg-gray-100 border-t border-gray-300 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
              <Crown size={14} className="text-blue-600" />
              <span>Medbank Güvenlik Protokolü ile korunuyorsunuz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

