import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Sparkles,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import {
  DemoCard,
  SubscriptionTier,
  BillingCycle,
  SUBSCRIPTION_PLANS,
  FREE_PLAN_CARD_LIMIT,
} from '../utils/finance';

interface UpgradePlanModalProps {
  isOpen: boolean;
  currentTier: SubscriptionTier;
  currentCardCount: number;
  cards: DemoCard[];
  onClose: () => void;
  onUpgradeComplete: (newTier: SubscriptionTier, billingCycle: BillingCycle) => void;
  onProceedToAddCard: () => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  currentTier,
  currentCardCount,
  cards,
  onClose,
  onUpgradeComplete,
  onProceedToAddCard,
}) => {
  const [step, setStep] = useState<'select-plan' | 'checkout' | 'confirmed'>('select-plan');
  const [selectedTier, setSelectedTier] = useState<'pro' | 'black'>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [selectedBillingCardId, setSelectedBillingCardId] = useState<string>(
    cards[0]?.id || ''
  );

  useEffect(() => {
    if (isOpen) {
      setStep('select-plan');
      setSelectedTier(currentTier === 'black' ? 'black' : 'pro');
      if (cards.length > 0) {
        setSelectedBillingCardId((prev) => prev || cards[0].id);
      }
    }
    // Only reset modal step when isOpen transitions to true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const activePlanSpec = SUBSCRIPTION_PLANS[selectedTier];
  const pricePerMonth =
    billingCycle === 'annual'
      ? activePlanSpec.annualMonthlyEquivalent
      : activePlanSpec.monthlyPrice;
  const billedToday =
    billingCycle === 'annual'
      ? activePlanSpec.annualTotal
      : activePlanSpec.monthlyPrice;

  const selectedBillingCard =
    cards.find((c) => c.id === selectedBillingCardId) || cards[0];

  const handleConfirmSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    onUpgradeComplete(selectedTier, billingCycle);
    setStep('confirmed');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-plan-title"
      data-testid="upgrade-plan-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 overflow-y-auto"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-[#151515] border border-[#303030] shadow-2xl overflow-hidden my-8">
        {/* Top Modal Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#303030] bg-[#111111]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1C1C1C] border border-[#303030] text-[11px] font-semibold uppercase tracking-wider text-[#FFFFFF] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>
                5th Card Limit Reached · {currentCardCount} / {FREE_PLAN_CARD_LIMIT} Standard Cards Active
              </span>
            </div>
            <h2
              id="upgrade-plan-title"
              className="text-xl sm:text-2xl font-bold text-[#FFFFFF] tracking-tight"
            >
              Upgrade Plan
            </h2>
            <p className="text-xs sm:text-sm text-[#B8B8B8] mt-1">
              {step === 'select-plan' &&
                'Adding a 5th card requires a PERQ Premium subscription. Choose a plan below to unlock unlimited cards.'}
              {step === 'checkout' &&
                `Complete your ${activePlanSpec.name} subscription setup to unlock unlimited wallet slots.`}
              {step === 'confirmed' &&
                `Your ${activePlanSpec.name} membership is now active. You can immediately add your 5th card.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Upgrade Plan modal"
            className="p-2 rounded-lg text-[#B8B8B8] hover:text-[#FFFFFF] hover:bg-[#252525] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-3 bg-[#080808] border-b border-[#303030] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4">
            <span
              className={`font-semibold ${
                step === 'select-plan' ? 'text-[#FFFFFF]' : 'text-[#858585]'
              }`}
            >
              1. Select Premium Tier
            </span>
            <span className="text-[#303030]">/</span>
            <span
              className={`font-semibold ${
                step === 'checkout' ? 'text-[#FFFFFF]' : 'text-[#858585]'
              }`}
            >
              2. Subscription Checkout
            </span>
            <span className="text-[#303030]">/</span>
            <span
              className={`font-semibold ${
                step === 'confirmed' ? 'text-[#FFFFFF]' : 'text-[#858585]'
              }`}
            >
              3. Unlock 5th Card
            </span>
          </div>
          <span className="font-mono-tabular text-[11px] text-[#858585] hidden sm:inline">
            Current Wallet: {currentCardCount} Cards
          </span>
        </div>

        {/* STEP 1: PLAN SELECTION */}
        {step === 'select-plan' && (
          <div className="flex flex-col">
            <div className="p-5 space-y-4 max-h-[62vh] overflow-y-auto">
              {/* Billing Cycle Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#111111] border border-[#303030]">
                <div>
                  <div className="text-xs font-semibold text-[#FFFFFF]">
                    Billing Frequency
                  </div>
                  <div className="text-xs text-[#858585]">
                    Save up to 22% with annual subscription billing.
                  </div>
                </div>

                <div
                  role="group"
                  aria-label="Billing Cycle"
                  className="inline-grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#080808] border border-[#303030]"
                >
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-[#FFFFFF] text-[#080808]'
                        : 'text-[#B8B8B8] hover:text-[#FFFFFF]'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      billingCycle === 'annual'
                        ? 'bg-[#FFFFFF] text-[#080808]'
                        : 'text-[#B8B8B8] hover:text-[#FFFFFF]'
                    }`}
                  >
                    Annual (Save 20%)
                  </button>
                </div>
              </div>

              {/* Tier Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Standard Tier (Current Limit Reached) */}
                <div className="rounded-2xl p-4 bg-[#111111] border border-[#303030] flex flex-col justify-between opacity-85">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#858585]">
                        Current Tier
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#303030] text-[10px] font-mono-tabular text-[#B8B8B8]">
                        4 / 4 Cards
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#FFFFFF]">
                      {SUBSCRIPTION_PLANS.standard.name}
                    </h3>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="font-mono-tabular text-2xl font-bold text-[#FFFFFF]">
                        $0
                      </span>
                      <span className="text-xs text-[#858585]">/ forever</span>
                    </div>
                    <p className="text-xs text-[#858585] mt-1.5 leading-relaxed">
                      {SUBSCRIPTION_PLANS.standard.description}
                    </p>

                    <ul className="mt-3 pt-3 border-t border-[#303030] space-y-2">
                      {SUBSCRIPTION_PLANS.standard.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-xs text-[#B8B8B8]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#858585] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#303030]">
                    <div className="w-full py-2 px-3 rounded-xl bg-[#1C1C1C] border border-[#303030] text-center text-xs font-medium text-[#858585]">
                      Limit Reached (Max 4 Cards)
                    </div>
                  </div>
                </div>

                {/* PERQ Pro Tier */}
                <div
                  onClick={() => setSelectedTier('pro')}
                  className={`rounded-2xl p-4 flex flex-col justify-between transition-colors cursor-pointer ${
                    selectedTier === 'pro'
                      ? 'bg-[#1C1C1C] border-2 border-[#FFFFFF]'
                      : 'bg-[#111111] border border-[#303030] hover:border-[#858585]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#FFFFFF] text-[#080808] text-[10px] font-bold uppercase tracking-wider">
                        Recommended
                      </span>
                      <span className="text-[11px] font-mono-tabular text-[#FFFFFF] font-semibold">
                        Unlimited Cards
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#FFFFFF]">
                      {SUBSCRIPTION_PLANS.pro.name}
                    </h3>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="font-mono-tabular text-2xl font-bold text-[#FFFFFF]">
                        $
                        {billingCycle === 'annual'
                          ? SUBSCRIPTION_PLANS.pro.annualMonthlyEquivalent
                          : SUBSCRIPTION_PLANS.pro.monthlyPrice}
                      </span>
                      <span className="text-xs text-[#B8B8B8]">/ month</span>
                    </div>
                    <p className="text-xs text-[#B8B8B8] mt-1.5 leading-relaxed">
                      {SUBSCRIPTION_PLANS.pro.description}
                    </p>

                    <ul className="mt-3 pt-3 border-t border-[#303030] space-y-2">
                      {SUBSCRIPTION_PLANS.pro.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-xs text-[#FFFFFF]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#FFFFFF] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#303030]">
                    <button
                      type="button"
                      onClick={() => setSelectedTier('pro')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        selectedTier === 'pro'
                          ? 'bg-[#FFFFFF] text-[#080808]'
                          : 'bg-[#151515] border border-[#303030] text-[#FFFFFF] hover:bg-[#252525]'
                      }`}
                    >
                      {selectedTier === 'pro' ? 'Selected: PERQ Pro' : 'Choose PERQ Pro'}
                    </button>
                  </div>
                </div>

                {/* PERQ Black Tier */}
                <div
                  onClick={() => setSelectedTier('black')}
                  className={`rounded-2xl p-4 flex flex-col justify-between transition-colors cursor-pointer ${
                    selectedTier === 'black'
                      ? 'bg-[#1C1C1C] border-2 border-[#FFFFFF]'
                      : 'bg-[#111111] border border-[#303030] hover:border-[#858585]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#252525] border border-[#303030] text-[#FFFFFF] text-[10px] font-semibold uppercase tracking-wider">
                        Concierge Tier
                      </span>
                      <span className="text-[11px] font-mono-tabular text-[#B8B8B8]">
                        Unlimited + Audit
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#FFFFFF]">
                      {SUBSCRIPTION_PLANS.black.name}
                    </h3>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="font-mono-tabular text-2xl font-bold text-[#FFFFFF]">
                        $
                        {billingCycle === 'annual'
                          ? SUBSCRIPTION_PLANS.black.annualMonthlyEquivalent
                          : SUBSCRIPTION_PLANS.black.monthlyPrice}
                      </span>
                      <span className="text-xs text-[#B8B8B8]">/ month</span>
                    </div>
                    <p className="text-xs text-[#B8B8B8] mt-1.5 leading-relaxed">
                      {SUBSCRIPTION_PLANS.black.description}
                    </p>

                    <ul className="mt-3 pt-3 border-t border-[#303030] space-y-2">
                      {SUBSCRIPTION_PLANS.black.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-xs text-[#B8B8B8]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#FFFFFF] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#303030]">
                    <button
                      type="button"
                      onClick={() => setSelectedTier('black')}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        selectedTier === 'black'
                          ? 'bg-[#FFFFFF] text-[#080808]'
                          : 'bg-[#151515] border border-[#303030] text-[#FFFFFF] hover:bg-[#252525]'
                      }`}
                    >
                      {selectedTier === 'black' ? 'Selected: PERQ Black' : 'Choose PERQ Black'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pinned Bottom Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-[#111111] border-t border-[#303030]">
              <div className="text-xs text-[#858585]">
                Selected: <strong className="text-[#FFFFFF]">{activePlanSpec.name}</strong> ($
                {pricePerMonth}/mo ·{' '}
                {billingCycle === 'annual'
                  ? `billed $${billedToday} annually`
                  : 'billed monthly'}
                )
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#1C1C1C] border border-[#303030] hover:bg-[#252525] text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
                <button
                  type="button"
                  data-testid="upgrade-continue-checkout-button"
                  onClick={() => setStep('checkout')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-xs font-semibold text-[#080808] transition-colors cursor-pointer"
                >
                  <span>Continue with {activePlanSpec.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#080808]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SUBSCRIPTION CHECKOUT */}
        {step === 'checkout' && (
          <form onSubmit={handleConfirmSubscription} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left: Billing Method Selector from Existing Wallet Cards */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#FFFFFF]">
                    Select Demo Billing Card
                  </h3>
                  <p className="text-xs text-[#858585] mt-0.5">
                    Choose one of your existing wallet cards to simulate the {activePlanSpec.name} subscription charge.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {cards.map((card) => {
                    const isSelected = selectedBillingCard?.id === card.id;
                    return (
                      <label
                        key={card.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C1C1C] border-[#FFFFFF]'
                            : 'bg-[#111111] border-[#303030] hover:border-[#858585]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="billingCard"
                            value={card.id}
                            checked={isSelected}
                            onChange={() => setSelectedBillingCardId(card.id)}
                            className="sr-only"
                          />
                          <CreditCard className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-[#FFFFFF]">
                              {card.issuer} · {card.nickname}
                            </div>
                            <div className="text-[11px] font-mono-tabular text-[#858585]">
                              {card.network} •••• {card.lastFour} · {card.baseRewardRate.toFixed(1)}% base reward
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isSelected
                              ? 'bg-[#FFFFFF] text-[#080808]'
                              : 'bg-[#151515] text-[#858585]'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#303030] flex items-start gap-2.5 text-xs text-[#B8B8B8]">
                  <ShieldCheck className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#FFFFFF]">Demo Subscription Simulation:</strong> No real payment is processed. Upgrading immediately unlocks unlimited card slots in your PERQ wallet.
                  </span>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="md:col-span-5 rounded-2xl bg-[#111111] border border-[#303030] p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#858585]">
                      Subscription Summary
                    </span>
                    <h4 className="text-lg font-bold text-[#FFFFFF] mt-0.5">
                      {activePlanSpec.name}
                    </h4>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[#303030] text-xs">
                    <div className="flex items-center justify-between text-[#B8B8B8]">
                      <span>Plan Capacity</span>
                      <span className="font-semibold text-[#FFFFFF]">Unlimited Cards</span>
                    </div>
                    <div className="flex items-center justify-between text-[#B8B8B8]">
                      <span>Billing Cycle</span>
                      <span className="font-semibold text-[#FFFFFF] capitalize">
                        {billingCycle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#B8B8B8]">
                      <span>Demo Billing Card</span>
                      <span className="font-mono-tabular text-[#FFFFFF]">
                        {selectedBillingCard
                          ? `${selectedBillingCard.nickname} (•••• ${selectedBillingCard.lastFour})`
                          : 'Demo Wallet'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#303030] flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-[#FFFFFF]">
                      Total Due Today (Demo)
                    </span>
                    <span className="font-mono-tabular text-2xl font-bold text-[#FFFFFF]">
                      ${billedToday}.00
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#303030]">
                  <button
                    type="submit"
                    data-testid="confirm-upgrade-button"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-xs font-semibold text-[#080808] transition-colors cursor-pointer"
                  >
                    <span>Confirm Upgrade & Unlock 5th Card</span>
                    <ArrowRight className="w-4 h-4 text-[#080808]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('select-plan')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1C1C1C] border border-[#303030] hover:bg-[#252525] text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Plan Comparison</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: UPGRADE CONFIRMED */}
        {step === 'confirmed' && (
          <div
            data-testid="upgrade-confirmed-view"
            className="p-8 text-center space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] text-[#080808] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded bg-[#1C1C1C] border border-[#303030] text-[11px] font-semibold uppercase tracking-wider text-[#FFFFFF]">
                {activePlanSpec.name} Active · Unlimited Cards Unlocked
              </span>
              <h3 className="text-2xl font-bold text-[#FFFFFF]">
                You&apos;re upgraded to {activePlanSpec.name}
              </h3>
              <p className="text-sm text-[#B8B8B8] leading-relaxed">
                Your 4-card Standard limit has been removed. You can now add your 5th card and unlimited additional bank designs to your PERQ wallet and 3D Studio.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl bg-[#111111] border border-[#303030] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-left">
                <Layers className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                <div>
                  <div className="font-semibold text-[#FFFFFF]">
                    Wallet Capacity Upgraded
                  </div>
                  <div className="text-[#858585]">
                    {currentCardCount} active cards · Unlimited slots available
                  </div>
                </div>
              </div>
              <span className="font-mono-tabular font-semibold text-[#FFFFFF]">
                {activePlanSpec.name}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                data-testid="upgrade-proceed-add-card-button"
                onClick={onProceedToAddCard}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-xs font-semibold text-[#080808] transition-colors cursor-pointer"
              >
                <span>Add Your 5th Card Now</span>
                <ArrowRight className="w-4 h-4 text-[#080808]" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1C1C1C] border border-[#303030] hover:bg-[#252525] text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
