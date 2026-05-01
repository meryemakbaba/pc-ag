import React from 'react';
import { Transaction } from '../utils/types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format amount with currency symbol (Türk Lirası)
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Gösterilecek işlem yok</p>
        </div>
      ) : (
        transactions.map((transaction) => (
          <div
            key={transaction.id}
            className={`relative p-4 rounded-lg border transition-all ${
              transaction.type === 'deposit'
                ? 'bg-green-900/10 border-green-700/30 hover:bg-green-900/20'
                : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
            }`}
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'deposit'
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-red-600/20 text-red-400'
                }`}
              >
                {transaction.type === 'deposit' ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
              </div>

              <div className="ml-4 flex-grow">
                <p className="text-sm font-medium text-white">
                  {transaction.type === 'deposit' ? 'Para Yatırma' : 'Para Çekme'}
                </p>
                <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
              </div>

              <div
                className={`text-right ${
                  transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                <p className="text-sm font-semibold">
                  {transaction.type === 'deposit' ? '+' : '-'}
                  {formatAmount(transaction.amount)}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionList;
