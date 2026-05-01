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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Arka plan sunucusu çalışıyor: http://localhost:${PORT}`);
});