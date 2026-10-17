import React, { useState } from 'react';
import { CalendarClock, CheckCircle2, Clock, Plus, RotateCcw } from 'lucide-react';
import {
  DemoBill,
  DemoCard,
  PurchaseCategory,
  PURCHASE_CATEGORIES,
  calculateBillsSummary,
  formatINR,
} from '../utils/finance';

interface BillsViewProps {
  bills: DemoBill[];
  cards: DemoCard[];
  hideBalances: boolean;
  onAddBill: (bill: Omit<DemoBill, 'id'>) => void;
  onToggleBillPaid: (billId: string) => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  cards,
  hideBalances,
  onAddBill,
  onToggleBillPaid,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-30');
  const [category, setCategory] = useState<PurchaseCategory>('Utilities');
  const [autopayCard, setAutopayCard] = useState(cards[0]?.nickname || 'Obsidian');
  const [error, setError] = useState('');

  const summary = calculateBillsSummary(bills);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter a bill name.');
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive bill amount in ₹.');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    onAddBill({
      name: cleanName,
      amount: Math.round(parsedAmount * 100) / 100,
      dueDate,
      category,
      status: 'pending',
      autopayCard,
    });

    setName('');
    setAmount('');
    setError('');
  };

  return (
    <div className="space-y-8">
      {/* Header & Pending Bills Count */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#303030]">
        <div>
          <p className="text-xs text-[#858585]">Upcoming Commitments · Bill Manager (INR ₹)</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] tracking-tight mt-1">
            Bills &amp; Recurring Statements
          </h1>
          <p className="text-sm text-[#B8B8B8] mt-1">
            Track recurring due dates in Indian Rupees (₹) and update bill payment statuses.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="rounded-2xl bg-[#151515] border border-[#303030] px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs text-[#B8B8B8]">
              <Clock className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>Pending Bills</span>
            </div>
            <div
              data-testid="bills-pending-count"
              className="font-mono-tabular text-xl font-bold text-[#FFFFFF] mt-1"
            >
              {summary.pendingCount} · {formatINR(summary.pendingTotal, hideBalances)}
            </div>
          </div>

          <div className="rounded-2xl bg-[#151515] border border-[#303030] px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs text-[#B8B8B8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>Paid</span>
            </div>
            <div className="font-mono-tabular text-xl font-bold text-[#FFFFFF] mt-1">
              {summary.paidCount} · {formatINR(summary.paidTotal, hideBalances)}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Add Bill Form + Bills List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Add Bill Form */}
        <section className="lg:col-span-5 rounded-2xl bg-[#151515] border border-[#303030] p-6">
          <h2 className="text-base font-bold text-[#FFFFFF]">Add Bill</h2>
          <p className="text-xs text-[#B8B8B8] mt-0.5 mb-4">
            Schedule a recurring bill in ₹ to track due dates and card pairings.
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
                htmlFor="bill-name-input"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Bill Name
              </label>
              <input
                id="bill-name-input"
                type="text"
                placeholder="e.g. Tata Play Fiber"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none focus:border-[#FFFFFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bill-amount-input"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Amount (₹)
                </label>
                <input
                  id="bill-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1499.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm font-mono-tabular text-[#FFFFFF] placeholder-[#858585] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div>
                <label
                  htmlFor="bill-duedate-input"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Due Date
                </label>
                <input
                  id="bill-duedate-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm font-mono-tabular text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bill-category-select"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Category
                </label>
                <select
                  id="bill-category-select"
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
                  htmlFor="bill-card-select"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Assigned Card
                </label>
                <select
                  id="bill-card-select"
                  value={autopayCard}
                  onChange={(e) => setAutopayCard(e.target.value)}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.nickname}>
                      {c.nickname}
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
              <span>Add Bill</span>
            </button>
          </form>
        </section>

        {/* Right: Bills List */}
        <section className="lg:col-span-7 rounded-2xl bg-[#151515] border border-[#303030] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#303030]">
            <div>
              <h2 className="text-base font-bold text-[#FFFFFF]">
                Scheduled Bills ({bills.length})
              </h2>
              <p className="text-xs text-[#B8B8B8] mt-0.5">
                Marking a bill as paid updates your tracker status only and never initiates a bank transfer.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#303030] mt-2">
            {bills.map((bill) => {
              const isPaid = bill.status === 'paid';
              return (
                <div
                  key={bill.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarClock
                        className={`w-4 h-4 shrink-0 ${
                          isPaid ? 'text-[#858585]' : 'text-[#FFFFFF]'
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          isPaid ? 'text-[#858585] line-through' : 'text-[#FFFFFF]'
                        }`}
                      >
                        {bill.name}
                      </span>
                    </div>
                    <div className="text-xs text-[#858585] mt-1">
                      <span>Due {bill.dueDate}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{bill.category}</span>
                      <span aria-hidden="true"> · </span>
                      <span>Card: {bill.autopayCard}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-[#FFFFFF] font-medium">
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="font-mono-tabular text-base font-bold text-[#FFFFFF]">
                      {formatINR(bill.amount, hideBalances)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onToggleBillPaid(bill.id)}
                      aria-label={
                        isPaid
                          ? `Mark ${bill.name} as pending`
                          : `Mark ${bill.name} as paid`
                      }
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                        isPaid
                          ? 'bg-[#1C1C1C] border border-[#303030] text-[#FFFFFF] hover:bg-[#252525]'
                          : 'bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#080808]'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-[#FFFFFF]" />
                          <span>Mark Pending</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#080808]" />
                          <span>Mark as Paid</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
