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

    if (!cardNumber || cardNumber.length !== 16) {
      return res.status(400).json({ error: "Kart numarası tam olarak 16 haneli olmalıdır." });
    }
    
    const newUser = await prisma.user.create({
      data: {
        cardNumber,
        password,
        firstName,
        lastName,
        balance: 1500.0, // Sisteme yeni girene 1500 TL hoş geldin bonusu :)
        creditDebt: 4500.0 // Başlangıç kredi kartı borcu
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

// --- YENİ: PARA İŞLEMLERİ (Yatırma/Çekme) ---
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

    // Bakiyeyi güncelle
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { balance: { increment: type.toLowerCase() === 'deposit' ? parseFloat(amount) : -parseFloat(amount) } }
    });

    res.json({ success: true, newBalance: updatedUser.balance, transaction });
  } catch (error) {
    res.status(500).json({ error: "İşlem gerçekleştirilemedi." });
  }
});

// --- YENİ: PARA TRANSFERİ ROTASI ---
app.post('/api/transfer', async (req, res) => {
  try {
    const { senderUserId, receiverCardNumber, amount } = req.body;
    const parsedAmount = parseFloat(amount);

    // Göndereni bul
    const sender = await prisma.user.findUnique({ where: { id: parseInt(senderUserId) } });
    if (!sender) return res.status(404).json({ error: 'Gönderen kullanıcı bulunamadı.' });
    if (sender.balance < parsedAmount) return res.status(400).json({ error: 'Yetersiz bakiye.' });

    // Alıcıyı kart numarasıyla bul
    const receiver = await prisma.user.findUnique({ where: { cardNumber: receiverCardNumber } });
    if (!receiver) return res.status(404).json({ error: 'Bu kart numarasına ait hesap bulunamadı.' });
    if (sender.id === receiver.id) return res.status(400).json({ error: 'Kendi hesabınıza transfer yapamazsınız.' });

    // Gönderenden düş
    const updatedSender = await prisma.user.update({
      where: { id: sender.id },
      data: { balance: { decrement: parsedAmount } }
    });

    // Alıcıya ekle
    await prisma.user.update({
      where: { id: receiver.id },
      data: { balance: { increment: parsedAmount } }
    });

    // Gönderen işlem kaydı
    await prisma.transaction.create({
      data: {
        amount: parsedAmount,
        type: 'TRANSFER',
        description: `Transfer: ${receiver.firstName} ${receiver.lastName}'e gönderildi`,
        userId: sender.id
      }
    });

    // Alıcı işlem kaydı
    await prisma.transaction.create({
      data: {
        amount: parsedAmount,
        type: 'DEPOSIT',
        description: `Transfer: ${sender.firstName} ${sender.lastName}'den alındı`,
        userId: receiver.id
      }
    });

    res.json({ success: true, newBalance: updatedSender.balance });
  } catch (error) {
    res.status(500).json({ error: 'Transfer gerçekleştirilemedi.' });
  }
});

// --- YENİ: İŞLEM GEÇMİŞİNİ GETİRME ROTASI ---
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedTransactions = transactions.map(t => {
      let fType = t.type.toLowerCase();
      if (fType === 'withdraw') fType = 'withdrawal'; 
      
      return {
        id: t.id.toString(),
        type: fType,
        amount: t.amount,
        title: t.description || 'İşlem',
        date: t.createdAt
      };
    });
    
    res.json({ balance: user.balance, creditDebt: user.creditDebt, transactions: formattedTransactions });
  } catch (error) {
    res.status(500).json({ error: "İşlem geçmişi alınamadı." });
  }
});

// --- YENİ: BORÇ ÖDEME ROTASI ---
app.post('/api/pay-debt', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const parsedAmount = parseFloat(amount);

    // Önce kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    if (parsedAmount > user.creditDebt) return res.status(400).json({ error: 'Borç tutarından fazla ödeme yapılamaz.' });

    // Bakiyeyi düşür, borcu azalt
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        balance: { decrement: parsedAmount },
        creditDebt: { decrement: parsedAmount }
      }
    });

    await prisma.transaction.create({
      data: {
        amount: parsedAmount,
        type: 'WITHDRAW',
        description: 'Kredi Kartı Borç Ödemesi',
        userId: parseInt(userId)
      }
    });

    res.json({ success: true, newBalance: updatedUser.balance, newCreditDebt: updatedUser.creditDebt });
  } catch (error) {
    res.status(500).json({ error: 'Borç ödemesi başarısız.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Arka plan sunucusu çalışıyor: http://localhost:${PORT}`);
});