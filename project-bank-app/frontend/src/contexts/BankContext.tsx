import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '../utils/types';

interface BankContextType {
  balance: number;
  creditCardDebt: number; // Kredi kartı borcu
  transactions: Transaction[];
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  payDebt: (amount: number) => void; // Borç ödeme fonksiyonu
}

const BankContext = createContext<BankContextType | undefined>(undefined);

const generateFakeTransactions = (): Transaction[] => {
  const types = ['deposit', 'withdrawal'] as const;
  const transactions: Transaction[] = [];
  const titles = ['Market Harcaması', 'Maaş Ödemesi', 'Kira', 'Online Alışveriş', 'Restoran'];
  
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 1000) + 100;
    const title = titles[Math.floor(Math.random() * titles.length)];
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    transactions.push({
      id: i.toString(),
      type,
      amount,
      title, 
      date: date.toISOString(),
    });
  }
  return transactions;
};

export const BankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(5280.42);
  const [creditCardDebt, setCreditCardDebt] = useState<number>(4500.00); // Herkes 4500 TL borçla başlar
  const [transactions, setTransactions] = useState<Transaction[]>(generateFakeTransactions());

  const deposit = (amount: number) => {
    if (amount <= 0) return;
    setBalance((prev) => prev + amount);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount,
      title: 'Para Yatırma',
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const withdraw = (amount: number) => {
    if (amount <= 0 || amount > balance) return;
    setBalance((prev) => prev - amount);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      title: 'Para Çekme',
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const payDebt = (amount: number) => {
    if (amount <= 0 || amount > balance) return;
    
    setBalance((prev) => prev - amount);
    setCreditCardDebt((prev) => prev - amount);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      title: 'Kredi Kartı Borç Ödemesi',
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <BankContext.Provider value={{ balance, creditCardDebt, transactions, deposit, withdraw, payDebt }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = (): BankContextType => {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};