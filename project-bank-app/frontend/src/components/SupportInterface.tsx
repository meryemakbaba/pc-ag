import React, { useState } from 'react';
import { LogOut, LayoutGrid, Phone, Mail, MessageSquare, ChevronDown, ChevronUp, HelpCircle, ShieldCheck, Clock } from 'lucide-react';
import Button from './shared/Button';

interface SupportInterfaceProps {
  onLogout: () => void;
  username: string;
  onSelectService: () => void;
}

const SupportInterface: React.FC<SupportInterfaceProps> = ({ onLogout, username, onSelectService }) => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const faqs = [
    {
      question: "Günlük para çekme limitimi nasıl artırabilirim?",
      answer: "Günlük para çekme limitiniz güvenlik gereği standart olarak 5.000 ₺ olarak belirlenmiştir. Limit artırım taleplerinizi şubelerimizden veya müşteri hizmetlerini arayarak iletebilirsiniz."
    },
    {
      question: "Kredi kartı borcumun asgarisini ödediğimde ne olur?",
      answer: "Asgari tutarı ödediğinizde kartınız kullanıma açık kalmaya devam eder. Ancak kalan borç tutarı üzerinden akdi faiz işletilmeye başlanır."
    },
    {
      question: "Şifremi unuttum veya bloke ettim, ne yapmalıyım?",
      answer: "Giriş ekranındaki 'Şifremi Unuttum' butonuna basarak veya 444 0 444 numaralı çağrı merkezimizi arayarak şifrenizi anında sıfırlayabilirsiniz."
    },
    {
      question: "Nakit avans taksitlendirilebilir mi?",
      answer: "Evet, 1.000 ₺ ve üzerindeki nakit avans kullanımlarınızı 12 aya kadar uygun faiz oranlarıyla taksitlendirebilirsiniz."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* HEADER */}
      <header className="bg-gray-200 bg-opacity-30 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-300/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center shadow-lg">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-950 tracking-tight">Destek Merkezi</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-800 font-bold opacity-70">7/24 Yanınızdayız</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button text="Ana Ekrana Dön" onClick={onSelectService} variant="secondary" icon={<LayoutGrid size={16} />} className="rounded-full" />
            <button onClick={onLogout} className="p-2.5 rounded-full bg-red-50 text-red-600 border border-red-100 transition-all hover:bg-red-100">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-blue-950 mb-4">Size nasıl yardımcı olabiliriz?</h2>
          <p className="text-gray-500 font-medium">Hızlı çözümler için SSS bölümüne göz atabilir veya bize ulaşabilirsiniz.</p>
        </div>

        {/* İLETİŞİM KANALLARI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-50 p-8 rounded-[2.5rem] text-center border border-blue-100 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform">
              <Phone size={24} />
            </div>
            <h4 className="font-bold text-blue-950 mb-1">Müşteri Hizmetleri</h4>
            <p className="text-blue-600 font-black">444 0 444</p>
          </div>
          <div className="bg-indigo-50 p-8 rounded-[2.5rem] text-center border border-indigo-100 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform">
              <Mail size={24} />
            </div>
            <h4 className="font-bold text-blue-950 mb-1">E-Posta Desteği</h4>
            <p className="text-indigo-600 font-black">destek@medbank.com</p>
          </div>
          <div className="bg-purple-50 p-8 rounded-[2.5rem] text-center border border-purple-100 transition-all hover:shadow-lg group">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <h4 className="font-bold text-blue-950 mb-1">Canlı Destek</h4>
            <p className="text-purple-600 font-black">Mobil Uygulama</p>
          </div>
        </div>

        {/* SIKÇA SORULAN SORULAR */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8 bg-gray-50 border-b border-gray-100">
            <h3 className="text-xl font-black text-blue-950 flex items-center">
              <HelpCircle className="mr-2 text-blue-600" /> Sıkça Sorulan Sorular
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <button
                  onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-blue-50/50 transition-all"
                >
                  <span className="font-bold text-blue-950">{faq.question}</span>
                  {openQuestion === index ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-gray-400" />}
                </button>
                {openQuestion === index && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-gray-600 leading-relaxed bg-white p-4 rounded-2xl border border-blue-50">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ALT BİLGİ KARTLARI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="flex items-center p-6 bg-green-50 rounded-3xl border border-green-100">
            <ShieldCheck className="text-green-600 mr-4" size={32} />
            <div>
              <h5 className="font-bold text-blue-950">Güvenli İşlem</h5>
              <p className="text-xs text-gray-500">Tüm verileriniz 256-bit SSL ile korunmaktadır.</p>
            </div>
          </div>
          <div className="flex items-center p-6 bg-orange-50 rounded-3xl border border-orange-100">
            <Clock className="text-orange-600 mr-4" size={32} />
            <div>
              <h5 className="font-bold text-blue-950">Kesintisiz Hizmet</h5>
              <p className="text-xs text-gray-500">ATM ve Dijital kanallarımız 7/24 aktiftir.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportInterface;