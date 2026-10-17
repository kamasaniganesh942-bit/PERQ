import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import {
  DemoCard,
  BankIssuer,
  BANK_ISSUERS,
  BANK_THEMES,
  PaymentNetwork,
  PurchaseCategory,
  PURCHASE_CATEGORIES,
  CardFinishPreset,
  sanitizeLastFour,
} from '../utils/finance';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (newCard: DemoCard) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onAddCard,
}) => {
  const [nickname, setNickname] = useState('');
  const [issuer, setIssuer] = useState<BankIssuer>('SBI');
  const [network, setNetwork] = useState<PaymentNetwork>('Visa');
  const [lastFour, setLastFour] = useState('');
  const [balance, setBalance] = useState('25000');
  const [baseRate, setBaseRate] = useState('2.0');
  const [bonusCategory, setBonusCategory] = useState<PurchaseCategory>('Dining');
  const [bonusRate, setBonusRate] = useState('4.5');
  const [finish, setFinish] = useState<CardFinishPreset>('satin');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleIssuerChange = (nextIssuer: BankIssuer) => {
    setIssuer(nextIssuer);
    setFinish(BANK_THEMES[nextIssuer].defaultFinish);
    if (nextIssuer === 'American Express') {
      setNetwork('Amex');
    } else if (network === 'Amex') {
      setNetwork('Visa');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nickname.trim();
    if (!cleanName) {
      setError('Please enter a card nickname (e.g. Horizon, Regalia).');
      return;
    }

    const digitsOnly = lastFour.replace(/\D/g, '');
    if (digitsOnly.length !== 4) {
      setError('Please enter exactly 4 digits for the masked card label.');
      return;
    }

    const parsedBalance = Number(balance);
    if (!Number.isFinite(parsedBalance) || parsedBalance < 0) {
      setError('Please enter a valid non-negative card balance.');
      return;
    }

    const parsedBaseRate = Number(baseRate);
    const parsedBonusRate = Number(bonusRate);
    if (
      !Number.isFinite(parsedBaseRate) ||
      parsedBaseRate <= 0 ||
      parsedBaseRate > 20 ||
      !Number.isFinite(parsedBonusRate) ||
      parsedBonusRate <= 0 ||
      parsedBonusRate > 25
    ) {
      setError('Reward percentages must be between 0.5% and 25%.');
      return;
    }

    const newCard: DemoCard = {
      id: `card-${Date.now()}`,
      nickname: cleanName,
      issuer,
      network,
      lastFour: sanitizeLastFour(digitsOnly),
      balance: Math.round(parsedBalance * 100) / 100,
      currency: 'INR',
      baseRewardRate: Math.round(parsedBaseRate * 10) / 10,
      categoryRates: {
        [bonusCategory]: Math.round(parsedBonusRate * 10) / 10,
      },
      finish,
      tagline: `${parsedBonusRate}% ${bonusCategory} & ${parsedBaseRate}% Base`,
    };

    onAddCard(newCard);
    setNickname('');
    setLastFour('');
    setBalance('25000');
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-card-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#151515] border border-[#303030] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#303030]">
          <div>
            <h2 id="add-card-modal-title" className="text-lg font-bold text-[#FFFFFF]">
              Add Card
            </h2>
            <p className="text-xs text-[#B8B8B8] mt-0.5">
              Add a custom bank card profile for reward comparisons and 3D inspection.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add Card modal"
            className="p-2 rounded-lg text-[#B8B8B8] hover:text-[#FFFFFF] hover:bg-[#252525] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 rounded-xl bg-[#1C1C1C] border border-[#303030] flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-[#B8B8B8] leading-relaxed">
            <strong className="text-[#FFFFFF] font-medium">Security Notice:</strong> Never enter real full card numbers, CVVs, PINs, or banking credentials. Only a nickname and 4 reference digits are used.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-[#1C1C1C] border border-[#FFFFFF] text-xs text-[#FFFFFF]"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="card-issuer-select"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Bank / Card Issuer
              </label>
              <select
                id="card-issuer-select"
                value={issuer}
                onChange={(e) => handleIssuerChange(e.target.value as BankIssuer)}
                className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
              >
                {BANK_ISSUERS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="card-nickname-input"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Card Nickname
              </label>
              <input
                id="card-nickname-input"
                type="text"
                placeholder="e.g. Horizon"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none focus:border-[#FFFFFF]"
              />
            </div>

            <div>
              <label
                htmlFor="card-network-select"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Payment Network
              </label>
              <select
                id="card-network-select"
                value={network}
                onChange={(e) => setNetwork(e.target.value as PaymentNetwork)}
                className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">Amex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="card-last-four-input"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Last 4 Digits
              </label>
              <input
                id="card-last-four-input"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="e.g. 5512"
                value={lastFour}
                onChange={(e) => {
                  setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setError('');
                }}
                className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm font-mono-tabular text-[#FFFFFF] placeholder-[#858585] focus:outline-none focus:border-[#FFFFFF]"
              />
            </div>

            <div>
              <label
                htmlFor="card-balance-input"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Card Balance (₹)
              </label>
              <input
                id="card-balance-input"
                type="number"
                step="0.01"
                min="0"
                value={balance}
                onChange={(e) => {
                  setBalance(e.target.value);
                  setError('');
                }}
                className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm font-mono-tabular text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="card-base-rate-input"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Base Reward (%)
              </label>
              <input
                id="card-base-rate-input"
                type="number"
                step="0.1"
                min="0.5"
                max="20"
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
                className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm font-mono-tabular text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
              />
            </div>

            <div>
              <label
                htmlFor="card-bonus-category-select"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Top Category
              </label>
              <select
                id="card-bonus-category-select"
                value={bonusCategory}
                onChange={(e) => setBonusCategory(e.target.value as PurchaseCategory)}
                className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
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
                htmlFor="card-bonus-rate-input"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Category Rate (%)
              </label>
              <input
                id="card-bonus-rate-input"
                type="number"
                step="0.1"
                min="0.5"
                max="25"
                value={bonusRate}
                onChange={(e) => setBonusRate(e.target.value)}
                className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3.5 py-2 text-sm font-mono-tabular text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#FFFFFF] mb-1.5">
              3D Surface Finish
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['satin', 'metallic', 'matte'] as CardFinishPreset[]).map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFinish(preset)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-colors cursor-pointer ${
                      finish === preset
                        ? 'bg-[#FFFFFF] text-[#080808] border-[#FFFFFF]'
                        : 'bg-[#080808] text-[#B8B8B8] border-[#303030] hover:bg-[#252525] hover:text-[#FFFFFF]'
                    }`}
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#303030]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#FFFFFF] bg-[#1C1C1C] hover:bg-[#252525] border border-[#303030] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#080808] bg-[#FFFFFF] hover:bg-[#E5E5E5] transition-colors cursor-pointer"
            >
              Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
