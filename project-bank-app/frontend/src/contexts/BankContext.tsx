import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '../utils/types';

interface BankContextType {
  balance: number;
  creditCardDebt: number;
  transactions: Transaction[];
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  payDebt: (amount: number, newDebtFromDB: number) => void;
  setInitialData: (balance: number, creditDebt: number, transactions: Transaction[]) => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const [creditCardDebt, setCreditCardDebt] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  // payDebt sadece local UI state'ini günceller; gerçek DB işlemi Dashboard/ATM'de yapılır
  const payDebt = (amount: number, newDebtFromDB: number) => {
    setBalance((prev) => prev - amount);
    setCreditCardDebt(newDebtFromDB);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      title: 'Kredi Kartı Borç Ödemesi',
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const setInitialData = (newBalance: number, newCreditDebt: number, newTransactions: Transaction[]) => {
    setBalance(newBalance);
    setCreditCardDebt(newCreditDebt);
    setTransactions(newTransactions);
  };

  return (
    <BankContext.Provider value={{ balance, creditCardDebt, transactions, deposit, withdraw, payDebt, setInitialData }}>
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