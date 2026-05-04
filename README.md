
# 🏦 ATM Simülasyonu & Online Bankacılık Sistemi

Marmara Üniversitesi Bilgisayar Mühendisliği Bölümü **Bilgisayar Ağları** dersi kapsamında geliştirilmiş, **İstemci-Sunucu (Client-Server)** mimarisine dayalı gerçek zamanlı bir bankacılık simülasyonudur. Sistem, bulut altyapısı üzerinde çalışan bir backend ve modern bir web arayüzü ile bütünleşik bir finansal işlem deneyimi sunar.

## 🚀 Proje Hakkında
Bu çalışma, OSI modelinin **Uygulama Katmanı** (HTTP/REST) protokollerini, sunucu tarafı veri yönetimini ve bulut tabanlı ağ mimarilerini uygulamalı olarak deneyimlemek amacıyla geliştirilmiştir.

*   **Canlı Uygulama (AWS ALB):** [banka-alb-1679531427.eu-north-1.elb.amazonaws.com]
(http://banka-alb-1679531427.eu-north-1.elb.amazonaws.com/)
*   **Akademik Dönem:** 2025–2026 Bahar

---

## 🛠 Teknoloji Yığını (Tech Stack)

### **Ön Yüz (Frontend)**
*   **Framework:** React 18 (Vite tabanlı)
*   **Dil:** TypeScript
*   **Durum Yönetimi:** React Context API (Global bakiye ve işlem senkronizasyonu)
*   **Styling & Animasyon:** Tailwind CSS & Framer Motion

### **Arka Yüz (Backend) & Veritabanı**
*   **Runtime:** Node.js 
*   **ORM:** Prisma ORM
*   **Veritabanı:** MySQL (AWS RDS veya EC2 üzerinde yapılandırılmış)
*   **Mimari:** RESTful API tasarım prensipleri

---

## 📁 Sistem Mimarisi ve Klasör Yapısı
Proje, veri güvenliğini ve modülerliği artırmak için **Üç Katmanlı (Three-Tier)** bir mimari yapısını takip eder.

```text
project-bank-app/
├── backend/
│   ├── index.js               # API rotaları, middleware ve sunucu yapılandırması
│   └── prisma/
│       ├── schema.prisma      # Veritabanı modelleri (User, Transaction)
│       └── migrations/        # Veritabanı sürüm yönetimi (tcId -> cardNumber geçişi)
└── frontend/
    └── src/
        ├── contexts/          # BankContext (Ağ durum yönetimi)
        ├── components/        # Dashboard ve Bütünleşik İşlem Bileşenleri
        ├── shared/            # Ortak kullanılan UI elementleri (Input, Button)
        └── utils/             # TypeScript tip tanımları ve yardımcı fonksiyonlar
```

---

## ☁️ Bulut Altyapısı (AWS Entegrasyonu)
Sistem, kurumsal düzeyde erişilebilirlik ve ağ güvenliği için AWS (Amazon Web Services) bileşenleri üzerinde koşturulmaktadır:

*   **Application Load Balancer (ALB):** İnternetten gelen HTTP trafiğini karşılar ve güvenli bir şekilde backend sunucusuna yönlendirir.
*   **VPC (Virtual Private Cloud):** Kamu ve Özel subnet ayrımı ile veritabanı katmanının dış ağlardan izole edilmesini sağlar.
*   **EC2 Instance:** Sunucu tarafı kodlarının (Node.js) çalıştığı ana işlem birimi.
*   **Güvenlik Grupları:** Port bazlı (3000, 80, 443) erişim kısıtlamaları ile ağ katmanı güvenliği.

---

## 🔐 Güvenlik ve İş Mantığı
*   **Girdi Doğrulama:** Kart numarası (16 hane), TC Kimlik (11 hane) ve e-posta formatları için uygulama katmanında Regex kontrolleri.
*   **Hata Yönetimi:** Ağ üzerinden dönen anlamlı HTTP durum kodları (400, 401, 404, 500) ile istemci tarafı hata yakalama.
*   **SQL Injection Koruması:** Prisma ORM kullanımı ile veritabanı seviyesinde güvenli sorgu yönetimi.
*   **İşlem Kısıtları:** Yetersiz bakiye kontrolü, kendi hesabına transfer engeli ve borç ödeme limitleri.

---

## ⚙️ Yerel Kurulum ve Çalıştırma

### **Backend**
1. `cd backend`
2. `npm install`
3. `.env` dosyasına veritabanı yolunu tanımlayın.
4. `node index.js`

### **Frontend**
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---
