import React, { useState, useEffect } from 'react';
import { LockKeyhole, CreditCard, ShieldCheck, HelpCircle, Timer, UserPlus } from 'lucide-react';
import Input from './shared/Input';
import Button from './shared/Button';
import { LoginFormData, VerificationData } from '../utils/types';

interface LoginProps {
  onLogin: (username: string) => void;
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
    let timer: NodeJS.Timeout;
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
    const newErrors = { ...errors };
    let isValid = true;

    if (type === 'login') {
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Kart numarası 16 haneli olmalıdır';
        isValid = false;
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
        newErrors.password = 'Şifre en az 8 karakter olmalı ve sayı ve harf içermelidir';
        isValid = false;
      }
    } else if (type === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'Adınızı giriniz';
        isValid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Geçersiz email adresi';
        isValid = false;
      }
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Kart numarası 16 haneli olmalıdır';
        isValid = false;
      }
      if (!/^\d{11}$/.test(formData.tcId)) {
        newErrors.tcId = 'TC Kimlik numarası 11 haneli olmalıdır';
        isValid = false;
      }
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        newErrors.phoneNumber = 'Telefon numarası 10 haneli olmalıdır';
        isValid = false;
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
        newErrors.password = 'Şifre en az 8 karakter olmalı ve sayı ve harf içermelidir';
        isValid = false;
      }
    } else if (type === 'forgot') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Geçersiz email adresi';
        isValid = false;
      }
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        newErrors.phoneNumber = 'Telefon numarası 10 haneli olmalıdır';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm('login')) {
      try {
        // Arayüzdeki boşluklu kart numarasını (1111 2222...) bitişik hale getiriyoruz
        const rawCardNumber = formData.cardNumber.replace(/\s/g, ''); 
        
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cardNumber: rawCardNumber, 
            password: formData.password 
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Backend'den onay gelirse içeri alıyoruz
          onLogin(data.user.firstName); 
        } else {
          // Şifre hatalıysa ekranda kırmızı uyarı gösteriyoruz
          setErrors({ ...errors, password: data.error });
        }
      } catch (error) {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header with logo */}
          <div className="p-6 text-center border-b border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              SeaPal
            </h1>
            <p className="text-gray-400 mt-1">Güvenilir finansal partneriniz</p>
          </div>

          {!showForgotPassword && !showRegister ? (
            /* Login form */
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <Input
                  id="cardNumber"
                  label="Kart Numarası"
                  type="text"
                  value={formatCardNumber(formData.cardNumber)}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  placeholder="16 haneli kart numaranızı giriniz"
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
                  className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
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
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              {!verification ? (
                <div className="space-y-4">
                  <Input
                    id="name"
                    label="Tam Adınız"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tam adınızı giriniz"
                    required
                    error={errors.name}
                  />

                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email adresinizi giriniz"
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

                  <Input
                    id="tcId"
                    label="TC Kimlik Numarası"
                    type="text"
                    value={formData.tcId}
                    onChange={(e) => setFormData({ ...formData, tcId: e.target.value.replace(/\D/g, '') })}
                    placeholder="11 haneli TC Kimlik numaranızı giriniz"
                    required
                    error={errors.tcId}
                  />

                  <Input
                    id="cardNumber"
                    label="Kart Numarası"
                    type="text"
                    value={formatCardNumber(formData.cardNumber)}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    placeholder="16 haneli kart numaranızı giriniz"
                    required
                    error={errors.cardNumber}
                  />

                  <Input
                    id="password"
                    label="Şifre"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Şifrenizi oluşturunuz"
                    required
                    error={errors.password}
                  />

                  <Button 
                    text="Kayıt Ol" 
                    onClick={() => {}} 
                    fullWidth 
                    icon={<UserPlus size={18} />} 
                  />
                </div>
              ) : (
                /* Verification section */
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Hesabınızı Doğrulayın</h3>
                    <p className="text-gray-400">Doğrulama kodlarını giriniz:</p>
                  </div>

                  <Input
                    id="emailCode"
                    label={`${verification.email} adresine gönderilen kod`}
                    type="text"
                    value={formData.emailCode || ''}
                    onChange={(e) => setFormData({ ...formData, emailCode: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    minLength={6}
                    placeholder="6 haneli kodu giriniz"
                    required
                    error={errors.emailCode}
                  />

                  <Input
                    id="phoneCode"
                    label={`${verification.phoneNumber} adresine gönderilen kod`}
                    type="text"
                    value={formData.phoneCode || ''}
                    onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    minLength={6}
                    placeholder="6 haneli kodu giriniz"
                    required
                    error={errors.phoneCode}
                  />

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <Timer size={14} className="mr-1" />
                      <span>Kalan süre: {formatTime(timeRemaining)}</span>
                    </div>
                    {canResend && (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                      >
                        Doğrulama kodlarını tekrar gönder
                      </button>
                    )}
                  </div>

                  <Button 
                    text="Hesabı Doğrula" 
                    onClick={() => {}} 
                    fullWidth 
                    icon={<ShieldCheck size={18} />} 
                  />
                </div>
              )}

              <Button 
                text="Giriş Yap" 
                onClick={() => {
                  setShowRegister(false);
                  setVerification(null);
                }} 
                fullWidth 
                variant="secondary"
                icon={<CreditCard size={18} />} 
              />
            </form>
          ) : (
            /* Forgot Password form */
            <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
              {!verification ? (
                <div className="space-y-4">
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email adresinizi giriniz"
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
                /* Verification section */
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Hesabınızı Doğrulayın</h3>
                    <p className="text-gray-400">Doğrulama kodlarını giriniz:</p>
                  </div>

                  <Input
                    id="emailCode"
                    label={`${verification.email} adresine gönderilen kod`}
                    type="text"
                    value={formData.emailCode || ''}
                    onChange={(e) => setFormData({ ...formData, emailCode: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    minLength={6}
                    placeholder="6 haneli kodu giriniz"
                    required
                    error={errors.emailCode}
                  />

                  <Input
                    id="phoneCode"
                    label={`${verification.phoneNumber} adresine gönderilen kod`}
                    type="text"
                    value={formData.phoneCode || ''}
                    onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value.replace(/\D/g, '') })}
                    maxLength={6} 
                    minLength={6}
                    placeholder="6 haneli kodu giriniz"
                    required
                    error={errors.phoneCode}
                  />

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <Timer size={14} className="mr-1" />
                      <span>Kalan süre: {formatTime(timeRemaining)}</span>
                    </div>
                    {canResend && (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                      >
                        Doğrulama kodlarını tekrar gönder
                      </button>
                    )}
                  </div>

                  <Button 
                    text="Hesabı Doğrula" 
                    onClick={() => {}} 
                    fullWidth 
                    icon={<ShieldCheck size={18} />} 
                  />
                </div>
              )}

              <Button 
                text="Giriş Yap" 
                onClick={() => {
                  setShowForgotPassword(false);
                  setVerification(null);
                }} 
                fullWidth 
                variant="secondary"
                icon={<CreditCard size={18} />} 
              />
            </form>
          )}

          {/* Security note */}
          <div className="p-4 bg-gray-800 bg-opacity-70 border-t border-gray-700 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={14} />
              <span>Güvenli Banka doğrulamasıyla korunuyor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

