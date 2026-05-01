# ATM‑ve‑Online‑Bankacilik‑Uygulamasi
# Online Bankacılık Ağı ve ATM Simülasyonu

> **Ders:** Bilgisayar Ağları – Proje Final Raporu  
> **Dönem:** 2024‑2025 Bahar  
> **Üniversite:** T.C. Marmara Üniversitesi, Teknoloji Fakültesi, Bilgisayar Mühendisliği Bölümü
> > **Proje Link:** http://bank-app.metricopt.com/

## Hazırlayanlar

| İsim |
| ---- |
| Arif Küçükeşmekaya |
| Şevval Çulcu |
| Ertuğrul Selim Öztürk |

---

## İçindekiler
- [Projenin Amacı](#projenin-amacı)
- [Projede Kullanılan Teknolojiler](#projede-kullanılan-teknolojiler)
- [Projede Neler Yapıldı?](#projede-neler-yapıldı)
- [Projenin Ağ Mimarisi ve Altyapı Kurulumu](#projenin-ağ-mimarisi-ve-altyapı-kurulumu)
- [Sistemin Çalışma Mantığı](#sistemin-çalışma-mantığı)
- [Sonuç ve Değerlendirme](#sonuc-ve-degerlendirme)
- [Projenin Arayüzü](#projenin-arayuzu)
- [Canlı Demo ve Kaynak Kod](#canli-demo-ve-kaynak-kod)

---

## Projenin Amacı
Bu projede, bilgisayar ağları üzerinde çalışan **bankacılık sistemi** simülasyonu geliştirildi.  

1. **ATM Modülü:** Para çekme, para yatırma, borç ödeme  
2. **Online Bankacılık Modülü:** Hesaplar arası transfer

Her iki modül de **istemci‑sunucu mimarisi** kullanır; istekler ağ üzerinden sunucuya iletilir, işlemler merkezi olarak yürütülür.

---

## Projede Kullanılan Teknolojiler
- **AWS VPC, Subnet, Internet/NAT Gateway**
- **EC2** (çoklu Availability Zone)
- **Application Load Balancer** + **Auto Scaling**
- **AWS IAM, WAF, Shield**
- **Amazon CloudWatch** (izleme & loglama)
- **Python / Flask** (örnek)

---

## Projede Neler Yapıldı?
1. Ağ mimarisi tasarımı ve VPC oluşturma  
2. Public / Private subnet yapılandırması  
3. Internet & NAT Gateway kurulumu  
4. EC2 örneklerinin dağıtılması  
5. Yük dengeleme ve otomatik ölçeklendirme  
6. Güvenlik politikalarının eklenmesi  
7. CloudWatch ile izleme ve alarm mekanizmaları  
8. ATM ve Online Bankacılık arayüzlerinin geliştirilmesi

---

## Projenin Ağ Mimarisi ve Altyapı Kurulumu
Aşağıdaki şemada, uygulamanın AWS üzerindeki dağıtımı gösterilmiştir:

<!-- görsel: aws_mimari.png -->

| Katman | Bileşenler | Açıklama |
| ------ | ---------- | -------- |
| **Kamu** | ALB, NAT Gateway | İnternetten gelen trafiğin ilk durağı |
| **Özel** | EC2 (Uygulama), RDS/DB | Kritik servisler korumalı subnet’te |
| **Güvenlik** | IAM, WAF, Shield | Kimlik yönetimi & saldırı koruması |

---

## Sistemin Çalışma Mantığı

```mermaid
sequenceDiagram
    participant Kullanıcı
    participant ALB
    participant EC2
    Kullanıcı->>ALB: HTTP(S) İsteği
    ALB->>EC2: Yönlendirme
    EC2-->>Kullanıcı: JSON/HTML Yanıt



