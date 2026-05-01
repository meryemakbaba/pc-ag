import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '../utils/types';

interface BankContextType {
  balance: number;
  transactions: Transaction[];
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

// Generate some fake transactions for the initial state
const generateFakeTransactions = (): Transaction[] => {
  const types = ['deposit', 'withdrawal'] as const;
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 1000) + 100;
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    transactions.push({
      id: i.toString(),
      type,
      amount,
      isFake: Math.random() > 0.7, // 30% chance to be fake
      date: date.toISOString(),
    });
  }
  
  return transactions;
};

export const BankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(5280.42);
  const [transactions, setTransactions] = useState<Transaction[]>(generateFakeTransactions());

  const deposit = (amount: number) => {
    if (amount <= 0) return;
    
    setBalance((prev) => prev + amount);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount,
      isFake: false,
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
      isFake: false,
      date: new Date().toISOString(),
    };
    
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <BankContext.Provider value={{ balance, transactions, deposit, withdraw }}>
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