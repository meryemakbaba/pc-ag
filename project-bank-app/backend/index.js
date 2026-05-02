const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- MEVCUT ROTA ---
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// --- YENİ: KULLANICI KAYIT ROTSASI ---
app.post('/api/register', async (req, res) => {
  try {
    const { cardNumber, password, firstName, lastName } = req.body;
    
    const newUser = await prisma.user.create({
      data: {
        cardNumber,
        password,
        firstName,
        lastName,
        balance: 1500.0 // Sisteme yeni girene 1500 TL hoş geldin bonusu :)
      }
    });
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: "Kayıt başarısız. Bu kart numarası zaten kayıtlı olabilir." });
  }
});

// --- YENİ: GİRİŞ YAPMA (LOGIN) ROTASI ---
app.post('/api/login', async (req, res) => {
  try {
    const { cardNumber, password } = req.body;
    
    // Veritabanından Kart Numarasına göre kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { cardNumber }
    });

    // Kullanıcı varsa ve şifre eşleşiyorsa
    if (user && user.password === password) {
      res.json({ message: "Giriş başarılı!", user });
    } else {
      res.status(401).json({ error: "Hatalı Kart Numarası veya Şifre!" });
    }
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası!" });
  }
});

// --- YENİ: PARA İŞLEMLERİ (Yatırma/Çekme/Transfer) ---
app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, amount, type, title } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: type.toUpperCase(),
        description: title,
        userId: parseInt(userId)
      }
    });

    // Bakiyeyi güncelle ve GÜNCEL KULLANICIYI döndür
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { balance: { increment: type === 'deposit' ? parseFloat(amount) : -parseFloat(amount) } }
    });

    res.json({ success: true, newBalance: updatedUser.balance, transaction });
  } catch (error) {
    res.status(500).json({ error: "İşlem gerçekleştirilemedi." });
  }
});

// --- YENİ: BORÇ ÖDEME ROTASI ---
app.post('/api/pay-debt', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Bakiyeyi düşür ve güncel kullanıcıyı al
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { balance: { decrement: parseFloat(amount) } }
    });

    await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type: 'WITHDRAW',
        description: 'Kredi Kartı Borç Ödemesi',
        userId: parseInt(userId)
      }
    });

    // BURASI KRİTİK: Güncel bakiyeyi frontend'e gönderiyoruz
    res.json({ success: true, newBalance: updatedUser.balance });
  } catch (error) {
    res.status(500).json({ error: "Borç ödemesi başarısız." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Arka plan sunucusu çalışıyor: http://localhost:${PORT}`);
});