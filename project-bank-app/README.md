# 🏦 ATM Simülasyonu & Online Bankacılık Sistemi

Marmara Üniversitesi Bilgisayar Mühendisliği Bölümü **Bilgisayar Ağları** dersi kapsamında geliştirilmiş, istemci-sunucu mimarisine dayalı gerçek zamanlı bir bankacılık sistemi simülasyonudur. Proje, modern web teknolojilerini ve AWS bulut altyapısını bir araya getirerek uçtan uca bir finansal uygulama deneyimi sunar.

## 🚀 Proje Hakkında
Bu çalışma, bilgisayar ağları üzerindeki uygulama katmanı protokollerini (HTTP/REST), sunucu tarafı veri yönetimini ve ölçeklenebilir bulut mimarilerini uygulamalı olarak deneyimlemek amacıyla geliştirilmiştir.

* **Canlı Demo:** [bank-app.metricopt.com](http://bank-app.metricopt.com/)
* **Akademik Dönem:** 2024–2025 Bahar

---

## 🛠 Teknoloji Yığını (Tech Stack)

### **Ön Yüz (Frontend)**
* **Framework:** React 18 (Vite tabanlı)
* **Dil:** TypeScript
* **Styling:** Tailwind CSS & Lucide Icons
* **Animasyon:** Framer Motion (Gerçekçi ATM deneyimi için)
* **Durum Yönetimi:** React Context API

### **Arka Yüz (Backend) & Veritabanı**
* **Runtime:** Node.js & Express.js
* **ORM:** Prisma ORM
* **Veritabanı:** MySQL (AWS üzerinde yapılandırılmış)
* **API Tasarımı:** RESTful mimari

---

## 📁 Sistem Mimarisi ve Klasör Yapısı
Proje, modülerliği ve sürdürülebilirliği artırmak için üç katmanlı (Three-Tier) bir mimariyi takip eder.

```text
project-bank-app/
├── backend/
│   ├── index.js               # API endpointleri ve middleware yapılandırması
│   └── prisma/
│       ├── schema.prisma      # Veritabanı modelleri (User, Transaction)
│       └── migrations/        # Veritabanı sürüm yönetimi
└── frontend/
    └── src/
        ├── contexts/          # BankContext (Finansal durum ve işlem yönetimi)
        ├── components/        # Dashboard, ATM, Transfer bileşenleri
        ├── shared/            # Ortak kullanılan UI elementleri
        └── utils/             # TypeScript arayüzleri ve yardımcı fonksiyonlar
☁️ Bulut Altyapısı (AWS Entegrasyonu)
Sistem, kurumsal düzeyde erişilebilirlik ve güvenlik için aşağıdaki AWS bileşenleri üzerinde çalışmaktadır:

VPC (Virtual Private Cloud): Kamu (Public) ve Özel (Private) subnet ayrımı ile güvenli ağ katmanı.

EC2 & ALB: Trafiği yönetmek için Application Load Balancer ve otomatik ölçeklendirme için Auto Scaling Group.

Güvenlik: AWS WAF (Web Application Firewall) ile yaygın web saldırılarına karşı aktif koruma.

İzleme: CloudWatch entegrasyonu ile metrik takibi.

🔐 Güvenlik ve İş Mantığı
Doğrulama: Kart numarası (16 hane), TC Kimlik (11 hane) ve e-posta formatları için regex kontrolleri.

İşlem Güvenliği: Prisma ORM kullanımı ile SQL Injection saldırılarına karşı koruma.

Doğrulama Simülasyonu: Şifre güncelleme süreçlerinde 180 saniyelik SMS/E-posta kod doğrulama mekanizması.

Bakiye Kontrolü: Yetersiz bakiye, kendi hesabına transfer engeli ve borç limiti kontrolleri.

⚙️ Kurulum ve Çalıştırma
Backend
cd backend

npm install

.env dosyasını oluşturun ve DATABASE_URL bilginizi girin.

npx prisma migrate dev

npm start

Frontend
cd frontend

npm install

npm run dev