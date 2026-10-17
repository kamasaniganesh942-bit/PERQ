import React from 'react';
import {
  Eye,
  EyeOff,
  Plus,
  Sparkles,
  PiggyBank,
  ReceiptText,
  CalendarClock,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import {
  DemoCard,
  Transaction,
  SampleOffer,
  DemoBill,
  calculateTotalWalletBalance,
  calculateExpenseSummary,
  calculateBillsSummary,
  formatINR,
} from '../utils/finance';
import { getFirstName } from '../utils/auth';
import { BankCardVisual } from './BankCardVisual';
import { CardStudio3D } from './CardStudio3D';

export type NavTab = 'home' | 'wallet' | 'smart-pick' | 'expenses' | 'offers' | 'bills';

interface DashboardViewProps {
  userFullName?: string;
  cards: DemoCard[];
  selectedCard: DemoCard;
  onSelectCard: (card: DemoCard) => void;
  transactions: Transaction[];
  offers: SampleOffer[];
  bills: DemoBill[];
  hideBalances: boolean;
  onToggleHideBalances: () => void;
  onOpenAddCard: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userFullName = 'Cardholder',
  cards,
  selectedCard,
  onSelectCard,
  transactions,
  offers,
  bills,
  hideBalances,
  onToggleHideBalances,
  onOpenAddCard,
  onNavigate,
}) => {
  const totalBalance = calculateTotalWalletBalance(cards);
  const expenseSummary = calculateExpenseSummary(transactions);
  const billsSummary = calculateBillsSummary(bills);
  const firstName = getFirstName(userFullName);

  return (
    <div className="space-y-8">
      {/* Welcome & Total Wallet Balance Hero */}
      <section className="rounded-2xl bg-[#151515] border border-[#303030] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs text-[#858585]">
              PERQ Workspace · Multi-Issuer Card &amp; Reward Overview
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] tracking-tight mt-1">
              Good morning, {firstName}
            </h1>
            <p className="text-sm text-[#B8B8B8] mt-1">
              Smarter Cards. Bigger Rewards. Compare reward rates and inspect 3D bank cards in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#303030]">
            <div className="mr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#B8B8B8]">Total Wallet Balance</span>
                <button
                  type="button"
                  onClick={onToggleHideBalances}
                  aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
                  className="p-1.5 rounded-lg text-[#B8B8B8] hover:text-[#FFFFFF] hover:bg-[#252525] transition-colors cursor-pointer"
                  title={hideBalances ? 'Show balances' : 'Hide balances'}
                >
                  {hideBalances ? (
                    <EyeOff className="w-4 h-4 text-[#FFFFFF]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[#B8B8B8]" />
                  )}
                </button>
              </div>
              <div
                data-testid="total-wallet-balance"
                className="font-mono-tabular text-2xl sm:text-3xl font-bold text-[#FFFFFF] mt-0.5"
              >
                {formatINR(totalBalance, hideBalances)}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAddCard}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-xs font-semibold text-[#080808] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#080808]" />
              <span>Add Card</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Summary Cards: Smart Pick, Savings, Spending, Bills */}
      <section aria-label="Quick Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('smart-pick')}
            className="text-left rounded-2xl bg-[#151515] border border-[#303030] hover:bg-[#252525] hover:border-[#858585] p-5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#B8B8B8] mb-3">
              <span className="text-xs font-medium">Smart Pick</span>
              <Sparkles className="w-4 h-4 text-[#FFFFFF]" />
            </div>
            <div className="text-lg font-bold text-[#FFFFFF]">
              Up to 5.0% Rewards
            </div>
            <p className="text-xs text-[#858585] mt-1 flex items-center justify-between">
              <span>SBI · Travel &amp; Amex · Shopping</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B8B8B8] group-hover:text-[#FFFFFF]" />
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('expenses')}
            className="text-left rounded-2xl bg-[#151515] border border-[#303030] hover:bg-[#252525] hover:border-[#858585] p-5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#B8B8B8] mb-3">
              <span className="text-xs font-medium">Savings (Estimated)</span>
              <PiggyBank className="w-4 h-4 text-[#FFFFFF]" />
            </div>
            <div className="font-mono-tabular text-lg font-bold text-[#FFFFFF]">
              {formatINR(expenseSummary.estimatedSampleSavings, hideBalances)}
            </div>
            <p className="text-xs text-[#858585] mt-1 flex items-center justify-between">
              <span>Estimated from {transactions.length} recorded purchases</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B8B8B8] group-hover:text-[#FFFFFF]" />
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('expenses')}
            className="text-left rounded-2xl bg-[#151515] border border-[#303030] hover:bg-[#252525] hover:border-[#858585] p-5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#B8B8B8] mb-3">
              <span className="text-xs font-medium">Spending</span>
              <ReceiptText className="w-4 h-4 text-[#FFFFFF]" />
            </div>
            <div className="font-mono-tabular text-lg font-bold text-[#FFFFFF]">
              {formatINR(expenseSummary.totalSpending, hideBalances)}
            </div>
            <p className="text-xs text-[#858585] mt-1 flex items-center justify-between">
              <span>Monthly statement total</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B8B8B8] group-hover:text-[#FFFFFF]" />
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('bills')}
            className="text-left rounded-2xl bg-[#151515] border border-[#303030] hover:bg-[#252525] hover:border-[#858585] p-5 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#B8B8B8] mb-3">
              <span className="text-xs font-medium">Bills</span>
              <CalendarClock className="w-4 h-4 text-[#FFFFFF]" />
            </div>
            <div className="font-mono-tabular text-lg font-bold text-[#FFFFFF]">
              {billsSummary.pendingCount} Pending ·{' '}
              {formatINR(billsSummary.pendingTotal, hideBalances)}
            </div>
            <p className="text-xs text-[#858585] mt-1 flex items-center justify-between">
              <span>{billsSummary.paidCount} marked paid</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B8B8B8] group-hover:text-[#FFFFFF]" />
            </p>
          </button>
        </div>
      </section>

      {/* Cards Grid + Interactive 3D Card Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#FFFFFF]">My Cards</h2>
            <p className="text-xs text-[#B8B8B8]">
              Select any bank card below (SBI, HDFC Bank, American Express, ICICI Bank, Axis Bank, or Kotak) to update the 3D Studio immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('wallet')}
            className="text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
          >
            Open Full Wallet →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => (
            <BankCardVisual
              key={card.id}
              card={card}
              selected={selectedCard.id === card.id}
              hideBalances={hideBalances}
              onSelect={onSelectCard}
            />
          ))}
        </div>

        {/* Interactive Three.js 3D Card Studio Preview */}
        <CardStudio3D
          cards={cards}
          selectedCard={selectedCard}
          hideBalances={hideBalances}
          onSelectCard={onSelectCard}
          cardholderName={userFullName}
          compact
        />
      </section>

      {/* Bottom 2-Column Split: Transactions & Nearby Offers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Transactions */}
        <section className="rounded-2xl bg-[#151515] border border-[#303030] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#303030]">
              <div>
                <h2 className="text-base font-bold text-[#FFFFFF]">
                  Transactions
                </h2>
                <p className="text-xs text-[#B8B8B8] mt-0.5">
                  Recent activity across your PERQ cards
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('expenses')}
                className="text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors whitespace-nowrap cursor-pointer"
              >
                Manage Expenses →
              </button>
            </div>

            <div className="divide-y divide-[#303030] mt-2">
              {transactions.slice(0, 4).map((tx) => (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-medium text-[#FFFFFF]">
                      {tx.merchant}
                    </div>
                    <div className="text-xs text-[#858585] mt-0.5">
                      <span>{tx.category}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{tx.cardNickname}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-tabular text-sm font-semibold text-[#FFFFFF]">
                      {formatINR(tx.amount, hideBalances)}
                    </div>
                    <div className="font-mono-tabular text-[11px] text-[#858585]">
                      +{tx.sampleRewardRate.toFixed(1)}% reward
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="py-8 text-center text-xs text-[#858585]">
                  No transactions recorded yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Nearby Offers */}
        <section className="rounded-2xl bg-[#151515] border border-[#303030] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#303030]">
              <div>
                <h2 className="text-base font-bold text-[#FFFFFF]">
                  Nearby Offers
                </h2>
                <p className="text-xs text-[#B8B8B8] mt-0.5">
                  Curated merchant perks for reward comparison
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('offers')}
                className="text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors whitespace-nowrap cursor-pointer"
              >
                Explore All Offers →
              </button>
            </div>

            <div className="divide-y divide-[#303030] mt-2">
              {offers.slice(0, 4).map((offer) => (
                <div
                  key={offer.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="text-sm font-medium text-[#FFFFFF]">
                      {offer.merchant}
                    </div>
                    <div className="text-xs text-[#858585] mt-0.5 flex items-center gap-1.5">
                      <span>{offer.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[#B8B8B8]">
                        <MapPin className="w-3 h-3 text-[#FFFFFF]" />
                        {offer.distanceLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Best with {offer.recommendedCard}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono-tabular text-xs font-semibold text-[#FFFFFF]">
                      {offer.discountLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
