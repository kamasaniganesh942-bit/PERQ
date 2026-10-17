import React from 'react';
import { X, Crown, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { FREE_PLAN_CARD_LIMIT } from '../utils/finance';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeConfirm: () => void;
  currentCardCount: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeConfirm,
  currentCardCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-pro-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white border border-zinc-300 p-6 sm:p-8 shadow-2xl text-zinc-950">
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono-tabular uppercase tracking-wider text-zinc-500 font-semibold">
                Card Limit Reached ({currentCardCount}/{FREE_PLAN_CARD_LIMIT} Cards)
              </span>
              <h2 id="upgrade-pro-title" className="text-xl font-bold text-zinc-950 mt-0.5">
                Upgrade to PERQ Pro
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Upgrade Modal"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <p className="text-sm text-zinc-600 leading-relaxed">
            The standard plan supports up to <strong className="text-zinc-950">{FREE_PLAN_CARD_LIMIT} Indian bank cards</strong> (such as SBI, HDFC, Axis, and Canara). Upgrade to <strong className="text-zinc-950">PERQ Pro</strong> to unlock unlimited cards in your portfolio.
          </p>

          {/* Plan Comparison Box */}
          <div className="rounded-2xl bg-zinc-950 text-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                PERQ Pro Membership
              </span>
              <span className="font-mono-tabular text-lg font-bold text-white">
                ₹199 <span className="text-xs font-normal text-zinc-400">/ month</span>
              </span>
            </div>

            <ul className="space-y-2 text-xs text-zinc-200 pt-2 border-t border-zinc-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white shrink-0" />
                <span>Add unlimited Indian credit &amp; debit cards beyond the 4-card cap</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white shrink-0" />
                <span>Full Smart Pick AI optimization across all custom bank cards</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white shrink-0" />
                <span>Custom 3D hardware studio finishes &amp; priority nearby shop discovery</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 flex items-start gap-2.5 text-xs text-zinc-600">
            <ShieldCheck className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" />
            <span>
              <strong className="text-zinc-950">Simulated Environment Upgrade:</strong> Clicking upgrade unlocks PERQ Pro immediately in this simulated workspace without charging any real money.
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Stay on Free Plan (4 Cards)
          </button>
          <button
            type="button"
            data-testid="confirm-pro-upgrade-button"
            onClick={onUpgradeConfirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activate PERQ Pro</span>
          </button>
        </div>
      </div>
    </div>
  );
};
