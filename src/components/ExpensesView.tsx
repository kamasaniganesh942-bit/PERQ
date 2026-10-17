import React, { useState } from 'react';
import { Plus, Trash2, ReceiptText, PiggyBank } from 'lucide-react';
import {
  DemoCard,
  Transaction,
  PurchaseCategory,
  PURCHASE_CATEGORIES,
  calculateExpenseSummary,
  formatINR,
  getCardRateForCategory,
} from '../utils/finance';

interface ExpensesViewProps {
  transactions: Transaction[];
  cards: DemoCard[];
  hideBalances: boolean;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  transactions,
  cards,
  hideBalances,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState<PurchaseCategory>('Dining');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-16');
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || 'card-aurora');
  const [error, setError] = useState('');

  const summary = calculateExpenseSummary(transactions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMerchant = merchant.trim();
    if (!cleanMerchant) {
      setError('Please enter a merchant name.');
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive transaction amount in ₹.');
      return;
    }

    if (!date) {
      setError('Please select a transaction date.');
      return;
    }

    const cardObj = cards.find((c) => c.id === selectedCardId) || cards[0];
    const rate = cardObj ? getCardRateForCategory(cardObj, category) : 2.0;

    onAddTransaction({
      merchant: cleanMerchant,
      category,
      amount: Math.round(parsedAmount * 100) / 100,
      date,
      cardNickname: cardObj ? cardObj.nickname : 'Aurora',
      sampleRewardRate: rate,
    });

    setMerchant('');
    setAmount('');
    setError('');
  };

  return (
    <div className="space-y-8">
      {/* Header & Totals Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#303030]">
        <div>
          <p className="text-xs text-[#858585]">Savings &amp; Expense Tracker (INR ₹)</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] tracking-tight mt-1">
            Expenses &amp; Estimated Savings
          </h1>
          <p className="text-sm text-[#B8B8B8] mt-1">
            Add or remove transactions in Indian Rupees (₹) to see total spending and estimated cashback update in real time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="rounded-2xl bg-[#151515] border border-[#303030] px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs text-[#B8B8B8]">
              <ReceiptText className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>Total Spending</span>
            </div>
            <div
              data-testid="expenses-total-spending"
              className="font-mono-tabular text-xl font-bold text-[#FFFFFF] mt-1"
            >
              {formatINR(summary.totalSpending, hideBalances)}
            </div>
          </div>

          <div className="rounded-2xl bg-[#151515] border border-[#303030] px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs text-[#B8B8B8]">
              <PiggyBank className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>Estimated Savings</span>
            </div>
            <div
              data-testid="expenses-sample-savings"
              className="font-mono-tabular text-xl font-bold text-[#FFFFFF] mt-1"
            >
              {formatINR(summary.estimatedSampleSavings, hideBalances)}
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Form + Transactions Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-5 rounded-2xl bg-[#151515] border border-[#303030] p-6">
          <h2 className="text-base font-bold text-[#FFFFFF]">Add Transaction</h2>
          <p className="text-xs text-[#B8B8B8] mt-0.5 mb-4">
            Log an expense in ₹ to update spending and estimated reward totals.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-[#1C1C1C] border border-[#FFFFFF] text-xs text-[#FFFFFF]"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="expense-merchant-input"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Transaction Merchant
              </label>
              <input
                id="expense-merchant-input"
                type="text"
                placeholder="e.g. Nature's Basket"
                value={merchant}
                onChange={(e) => {
                  setMerchant(e.target.value);
                  setError('');
                }}
                className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none focus:border-[#FFFFFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expense-category-select"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Category
                </label>
                <select
                  id="expense-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PurchaseCategory)}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
                >
                  {PURCHASE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="expense-amount-input"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Amount (₹)
                </label>
                <input
                  id="expense-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1250.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm font-mono-tabular text-[#FFFFFF] placeholder-[#858585] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expense-date-input"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Date
                </label>
                <input
                  id="expense-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm font-mono-tabular text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div>
                <label
                  htmlFor="expense-card-select"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Card
                </label>
                <select
                  id="expense-card-select"
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nickname} (•••• {c.lastFour})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-xs font-semibold text-[#080808] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#080808]" />
              <span>Add Transaction</span>
            </button>
          </form>
        </section>

        {/* Right: Transactions Ledger */}
        <section className="lg:col-span-7 rounded-2xl bg-[#151515] border border-[#303030] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#303030]">
              <div>
                <h2 className="text-base font-bold text-[#FFFFFF]">
                  Transactions ({transactions.length})
                </h2>
                <p className="text-xs text-[#B8B8B8] mt-0.5">
                  Estimated savings are calculated in INR (₹) using your card reward rates.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#303030] mt-2">
              {transactions.map((tx) => {
                const sampleEarned = (tx.amount * tx.sampleRewardRate) / 100;
                return (
                  <div
                    key={tx.id}
                    className="py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#FFFFFF] truncate">
                        {tx.merchant}
                      </div>
                      <div className="text-xs text-[#858585] mt-0.5">
                        <span>{tx.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{tx.cardNickname}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono-tabular">{tx.date}</span>
                        {tx.appliedExchangeRate && tx.exchangeRateUpdatedAt && (
                          <span className="block text-[11px] text-[#B8B8B8] mt-0.5">
                            Converted to INR at {formatINR(tx.appliedExchangeRate)}/1 USD (Est. updated {tx.exchangeRateUpdatedAt})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-mono-tabular text-sm font-semibold text-[#FFFFFF]">
                          {formatINR(tx.amount, hideBalances)}
                        </div>
                        <div className="font-mono-tabular text-[11px] text-[#858585]">
                          Est. +{formatINR(sampleEarned, hideBalances)} ({tx.sampleRewardRate.toFixed(1)}%)
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx.id)}
                        aria-label={`Delete transaction at ${tx.merchant}`}
                        className="p-2 rounded-lg text-[#B8B8B8] hover:text-[#FFFFFF] hover:bg-[#252525] transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {transactions.length === 0 && (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm text-[#FFFFFF] font-medium">
                    No transactions logged
                  </p>
                  <p className="text-xs text-[#858585]">
                    Use the form on the left to add an expense in ₹ and see totals update.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Category Spending Breakdown in INR */}
          <div className="mt-6 pt-5 border-t border-[#303030]">
            <h3 className="text-xs font-semibold text-[#858585] mb-3">
              Category Spending Breakdown (INR ₹)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PURCHASE_CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className="rounded-xl bg-[#080808] border border-[#303030] px-3 py-2"
                >
                  <span className="block text-[11px] text-[#858585]">{cat}</span>
                  <span className="font-mono-tabular text-xs font-semibold text-[#FFFFFF]">
                    {formatINR(summary.byCategory[cat] || 0, hideBalances)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
