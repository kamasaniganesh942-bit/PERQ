import React from 'react';
import { Wifi, Check } from 'lucide-react';
import { DemoCard, BANK_THEMES, formatINR } from '../utils/finance';
import { BankIssuerLogo, PaymentNetworkLogo } from './BankLogos';

interface BankCardVisualProps {
  card: DemoCard;
  selected?: boolean;
  hideBalances: boolean;
  onSelect?: (card: DemoCard) => void;
}

export const BankCardVisual: React.FC<BankCardVisualProps> = ({
  card,
  selected = false,
  hideBalances,
  onSelect,
}) => {
  const bankTheme = BANK_THEMES[card.issuer] || BANK_THEMES.SBI;

  // Find highest category rate for display
  const topRate = Math.max(
    card.baseRewardRate,
    ...Object.values(card.categoryRates).map((v) => v ?? 0)
  );

  return (
    <button
      type="button"
      onClick={() => onSelect?.(card)}
      aria-pressed={selected}
      aria-label={`Select ${card.issuer} ${card.nickname} ${card.network} card ending in ${card.lastFour}`}
      className={`group relative w-full text-left rounded-2xl p-5 transition-all duration-150 border cursor-pointer overflow-hidden ${
        bankTheme.cardTailwindBg
      } ${
        selected
          ? 'border-[#FFFFFF] ring-2 ring-[#FFFFFF] shadow-xl shadow-black/70 -translate-y-0.5'
          : `${bankTheme.cardTailwindBorder} opacity-95 hover:opacity-100`
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]`}
    >
      {/* Top Edge Bank Accent Bar */}
      <div
        className="absolute top-0 left-5 w-16 h-1 rounded-b"
        style={{ backgroundColor: bankTheme.headerBandColor }}
        aria-hidden="true"
      />

      {/* Top Row: Bank Logo (Top-Left) & Payment Network Logo (Top-Right) */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <BankIssuerLogo issuer={card.issuer} />
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-bold tracking-wider uppercase text-white/75">
              PERQ · {card.nickname}
            </span>
            {selected && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#080808] bg-[#FFFFFF] px-1.5 py-0.5 rounded">
                <Check className="w-2.5 h-2.5 text-[#080808]" />
                Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/70 mt-0.5">{card.tagline}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <PaymentNetworkLogo network={card.network} />
          <span className="text-[10px] uppercase tracking-wider text-white/60">
            {card.finish}
          </span>
        </div>
      </div>

      {/* Metallic EMV Chip & Masked Number Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-7 rounded-md bg-gradient-to-br from-[#F3D79B] to-[#C69F53] border border-white/30 flex items-center justify-center shadow-inner"
            aria-hidden="true"
          >
            <div className="w-6 h-4 rounded-xs border border-black/30 grid grid-cols-2 gap-px p-0.5">
              <div className="bg-black/20 rounded-xs" />
              <div className="bg-black/20 rounded-xs" />
            </div>
          </div>
          <Wifi className="w-3.5 h-3.5 text-white/60 rotate-90" aria-hidden="true" />
        </div>

        <div className="font-mono-tabular text-sm tracking-widest text-white/75">
          •••• •••• •••• <span className="text-white font-semibold">{card.lastFour}</span>
        </div>
      </div>

      {/* Bottom Row: Balance & Rewards Percentage */}
      <div className="pt-3 border-t border-white/15 flex items-end justify-between gap-4">
        <div>
          <span className="block text-[11px] text-white/65">Balance</span>
          <span className="font-mono-tabular text-lg font-semibold text-white">
            {formatINR(card.balance, hideBalances)}
          </span>
        </div>

        <div className="text-right">
          <span className="block text-[11px] text-white/65">Rewards</span>
          <span className="font-mono-tabular text-sm font-semibold text-white">
            Up to {topRate.toFixed(1)}%{' '}
            <span className="text-xs font-normal text-white/65">
              ({card.baseRewardRate.toFixed(1)}% base)
            </span>
          </span>
        </div>
      </div>
    </button>
  );
};
