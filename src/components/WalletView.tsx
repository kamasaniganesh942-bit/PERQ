import React from 'react';
import { Plus, ShieldCheck, Trash2 } from 'lucide-react';
import {
  DemoCard,
  PURCHASE_CATEGORIES,
  calculateTotalWalletBalance,
  formatINR,
  getCardRateForCategory,
} from '../utils/finance';
import { BankCardVisual } from './BankCardVisual';
import { CardStudio3D } from './CardStudio3D';

interface WalletViewProps {
  userFullName?: string;
  cards: DemoCard[];
  selectedCard: DemoCard;
  onSelectCard: (card: DemoCard) => void;
  hideBalances: boolean;
  onToggleHideBalances: () => void;
  onOpenAddCard: () => void;
  onDeleteCard: (cardId: string) => void;
}

const DEFAULT_CARD_IDS = [
  'card-aurora',
  'card-spectrum',
  'card-obsidian',
  'card-coral',
  'card-magnus',
  'card-zenith',
];

export const WalletView: React.FC<WalletViewProps> = ({
  userFullName = 'Cardholder',
  cards,
  selectedCard,
  onSelectCard,
  hideBalances,
  onOpenAddCard,
  onDeleteCard,
}) => {
  const totalBalance = calculateTotalWalletBalance(cards);
  const isCustomCard = !DEFAULT_CARD_IDS.includes(selectedCard.id);

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#303030]">
        <div>
          <p className="text-xs text-[#858585]">My Wallet &amp; Multi-Bank 3D Studio</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] tracking-tight mt-1">
            PERQ Card Portfolio
          </h1>
          <p className="text-sm text-[#B8B8B8] mt-1">
            Select any bank card (SBI, HDFC Bank, American Express, ICICI Bank, Axis Bank, or Kotak) to inspect its 3D finish, logo, and reward schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Interactive 3D Hardware Card Studio */}
      <section aria-label="3D Card Inspector">
        <CardStudio3D
          cards={cards}
          selectedCard={selectedCard}
          hideBalances={hideBalances}
          onSelectCard={onSelectCard}
          cardholderName={userFullName}
        />
      </section>

      {/* Selectable Bank-Card Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#FFFFFF]">
            My Cards ({cards.length})
          </h2>
          <span className="font-mono-tabular text-xs text-[#B8B8B8]">
            Combined Balance: {formatINR(totalBalance, hideBalances)}
          </span>
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
      </section>

      {/* Selected Card Reward Schedule & Security Disclosure */}
      <section className="rounded-2xl bg-[#151515] border border-[#303030] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#303030]">
          <div>
            <div className="text-xs text-[#858585]">
              Active Selection · {selectedCard.issuer} · {selectedCard.network} •••• {selectedCard.lastFour} ({selectedCard.finish} finish)
            </div>
            <h3 className="text-lg font-bold text-[#FFFFFF] mt-0.5">
              {selectedCard.issuer} {selectedCard.nickname} — Category Reward Schedule
            </h3>
          </div>

          {isCustomCard && (
            <button
              type="button"
              onClick={() => onDeleteCard(selectedCard.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#303030] text-xs font-medium text-[#FFFFFF] hover:bg-[#252525] transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#B8B8B8]" />
              <span>Remove Custom Card</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-5">
          {PURCHASE_CATEGORIES.map((category) => {
            const rate = getCardRateForCategory(selectedCard, category);
            const isBoosted = rate > selectedCard.baseRewardRate;
            return (
              <div
                key={category}
                className={`rounded-xl p-3.5 border ${
                  isBoosted
                    ? 'bg-[#1C1C1C] border-[#FFFFFF]'
                    : 'bg-[#080808] border-[#303030]'
                }`}
              >
                <span className="block text-xs text-[#B8B8B8]">{category}</span>
                <span className="font-mono-tabular text-lg font-bold text-[#FFFFFF] mt-1 block">
                  {rate.toFixed(1)}%
                </span>
                <span className="block text-[11px] text-[#858585] mt-0.5">
                  {isBoosted ? 'Boosted tier' : 'Base tier'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-[#303030] flex items-center gap-2 text-xs text-[#858585]">
          <ShieldCheck className="w-4 h-4 text-[#FFFFFF] shrink-0" />
          <span>
            Simulated Environment Notice: Illustrative bank-inspired card designs. PERQ never requests or stores real card numbers, CVVs, PINs, OTPs, or banking passwords.
          </span>
        </div>
      </section>
    </div>
  );
};
