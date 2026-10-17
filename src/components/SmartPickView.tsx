import React, { useState, useEffect } from 'react';
import { Sparkles, Calculator, Award, CheckCircle2, Info, ArrowRightLeft } from 'lucide-react';
import {
  DemoCard,
  PurchaseCategory,
  PURCHASE_CATEGORIES,
  CurrencyCode,
  DEFAULT_USD_TO_INR_FALLBACK_RATE,
  FALLBACK_EXCHANGE_RATE_UPDATED_AT,
  convertUsdToInr,
  evaluateSmartPick,
  formatINR,
} from '../utils/finance';

interface SmartPickViewProps {
  cards: DemoCard[];
  initialMerchant?: string;
  initialCategory?: PurchaseCategory;
  initialAmount?: string;
  onLogSimulatedPurchase?: (tx: {
    merchant: string;
    category: PurchaseCategory;
    amount: number;
    originalUsdAmount?: number;
    appliedExchangeRate?: number;
    exchangeRateUpdatedAt?: string;
    cardNickname: string;
    sampleRewardRate: number;
  }) => void;
}

const SAMPLE_SCENARIOS: {
  merchant: string;
  amount: string;
  category: PurchaseCategory;
}[] = [
  { merchant: 'Whole Foods Market', amount: '2500.00', category: 'Groceries' },
  { merchant: 'Skyline Airlines', amount: '12500.00', category: 'Travel' },
  { merchant: 'Osteria Nove Dining', amount: '1850.00', category: 'Dining' },
  { merchant: 'Atelier Mono Store', amount: '8500.00', category: 'Shopping' },
];

export const SmartPickView: React.FC<SmartPickViewProps> = ({
  cards,
  initialMerchant = 'Whole Foods Market',
  initialCategory = 'Groceries',
  initialAmount = '2500.00',
  onLogSimulatedPurchase,
}) => {
  const [merchant, setMerchant] = useState(initialMerchant);
  const [amountStr, setAmountStr] = useState(initialAmount);
  const [inputCurrency, setInputCurrency] = useState<CurrencyCode>('INR');
  const [exchangeRateStr, setExchangeRateStr] = useState(
    String(DEFAULT_USD_TO_INR_FALLBACK_RATE)
  );
  const [category, setCategory] = useState<PurchaseCategory>(initialCategory);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  useEffect(() => {
    if (initialMerchant) setMerchant(initialMerchant);
    if (initialCategory) setCategory(initialCategory);
    if (initialAmount) {
      setAmountStr(initialAmount);
      setInputCurrency('INR');
    }
  }, [initialMerchant, initialCategory, initialAmount]);

  const numericAmount = Number(amountStr);
  const isValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const parsedRate = Number(exchangeRateStr);
  const activeExchangeRate =
    Number.isFinite(parsedRate) && parsedRate > 0
      ? parsedRate
      : DEFAULT_USD_TO_INR_FALLBACK_RATE;

  const usdConversion =
    inputCurrency === 'USD' && isValidAmount
      ? convertUsdToInr(numericAmount, activeExchangeRate, FALLBACK_EXCHANGE_RATE_UPDATED_AT)
      : null;

  const effectiveAmountINR = isValidAmount
    ? inputCurrency === 'USD' && usdConversion
      ? usdConversion.inrAmount
      : numericAmount
    : 0;

  const evaluation = evaluateSmartPick(
    cards,
    effectiveAmountINR,
    category,
    merchant
  );

  const recommended = evaluation.recommended;
  const runnerUp = evaluation.runnerUp;

  const handleRequestAiInsight = async () => {
    if (!recommended || !isValidAmount) return;
    setAiLoading(true);
    setAiInsight(null);
    try {
      const response = await fetch('/api/smart-pick-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantName: evaluation.merchantName,
          amount: evaluation.amount,
          category: evaluation.category,
          recommendedCardName: recommended.card.nickname,
          recommendedRate: recommended.appliedRate,
          estimatedReward: recommended.estimatedReward,
          runnerUpCardName: runnerUp?.card.nickname,
          runnerUpReward: runnerUp?.estimatedReward,
        }),
      });
      const data = await response.json();
      if (data.insight) {
        setAiInsight(data.insight);
      } else {
        setAiInsight(recommended.explanation);
      }
    } catch {
      setAiInsight(
        `Based on your card reward rates, ${recommended.card.nickname} provides the highest return (${recommended.appliedRate.toFixed(
          1
        )}%) for ${category}, earning an estimated ${formatINR(
          recommended.estimatedReward
        )} on a ${formatINR(evaluation.amount)} purchase.`
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogPurchase = () => {
    if (!recommended || !isValidAmount || !onLogSimulatedPurchase) return;
    onLogSimulatedPurchase({
      merchant: evaluation.merchantName,
      category: evaluation.category,
      amount: evaluation.amount,
      ...(inputCurrency === 'USD' && usdConversion
        ? {
            originalUsdAmount: numericAmount,
            appliedExchangeRate: usdConversion.appliedRate,
            exchangeRateUpdatedAt: usdConversion.lastUpdated,
          }
        : {}),
      cardNickname: recommended.card.nickname,
      sampleRewardRate: recommended.appliedRate,
    });
    setLoggedSuccess(true);
    setTimeout(() => setLoggedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="pb-6 border-b border-[#303030]">
        <p className="text-xs text-[#858585]">Reward Optimizer · Category Rate Calculator (INR ₹)</p>
        <h1 className="text-2xl font-bold text-[#FFFFFF] tracking-tight mt-1">
          Smart Pick AI
        </h1>
        <p className="text-sm text-[#B8B8B8] mt-1">
          Enter a merchant, purchase amount in Indian Rupees (₹), and category to calculate which card in your wallet earns the highest estimated reward.
        </p>
      </div>

      {/* Main 2-Column Split: Simulator Form + Recommended Winner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Input Form */}
        <section className="lg:col-span-5 rounded-2xl bg-[#151515] border border-[#303030] p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#FFFFFF]">
                  Purchase Details
                </h2>
                <p className="text-xs text-[#B8B8B8] mt-0.5">
                  Try a preset scenario in ₹ or enter any merchant and amount below.
                </p>
              </div>

              {/* Currency Input Mode Toggle (Native INR vs USD-to-INR Conversion) */}
              <div
                role="group"
                aria-label="Purchase Currency Input Mode"
                className="inline-flex rounded-lg bg-[#080808] border border-[#303030] p-0.5 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    setInputCurrency('INR');
                    setAiInsight(null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                    inputCurrency === 'INR'
                      ? 'bg-[#FFFFFF] text-[#080808]'
                      : 'text-[#B8B8B8] hover:text-[#FFFFFF]'
                  }`}
                >
                  INR (₹)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputCurrency('USD');
                    setAiInsight(null);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                    inputCurrency === 'USD'
                      ? 'bg-[#FFFFFF] text-[#080808]'
                      : 'text-[#B8B8B8] hover:text-[#FFFFFF]'
                  }`}
                >
                  Convert USD → ₹
                </button>
              </div>
            </div>

            {/* Quick Scenario Presets */}
            <div>
              <span className="block text-[11px] text-[#858585] mb-2">
                Quick Scenarios (INR)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_SCENARIOS.map((preset) => (
                  <button
                    key={preset.merchant}
                    type="button"
                    onClick={() => {
                      setMerchant(preset.merchant);
                      setAmountStr(preset.amount);
                      setInputCurrency('INR');
                      setCategory(preset.category);
                      setAiInsight(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#1C1C1C] border border-[#303030] hover:bg-[#252525] hover:border-[#FFFFFF] text-xs text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {preset.category} · {formatINR(Number(preset.amount))}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="smartpick-merchant-input"
                className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
              >
                Merchant Name
              </label>
              <input
                id="smartpick-merchant-input"
                type="text"
                value={merchant}
                placeholder="e.g. Blue Bottle Coffee"
                onChange={(e) => {
                  setMerchant(e.target.value);
                  setAiInsight(null);
                }}
                className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none focus:border-[#FFFFFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="smartpick-amount-input"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  {inputCurrency === 'INR' ? 'Purchase Amount (₹)' : 'Foreign Spend (USD)'}
                </label>
                <input
                  id="smartpick-amount-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountStr}
                  placeholder="2500.00"
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    setAiInsight(null);
                  }}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2.5 text-sm font-mono-tabular text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div>
                <label
                  htmlFor="smartpick-category-select"
                  className="block text-xs font-medium text-[#FFFFFF] mb-1.5"
                >
                  Purchase Category
                </label>
                <select
                  id="smartpick-category-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as PurchaseCategory);
                    setAiInsight(null);
                  }}
                  className="w-full rounded-xl bg-[#080808] border border-[#303030] px-3.5 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
                >
                  {PURCHASE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transparent USD-to-INR Conversion Panel (shown when converting from USD) */}
            {inputCurrency === 'USD' && (
              <div
                data-testid="usd-inr-conversion-box"
                className="rounded-xl bg-[#1C1C1C] border border-[#303030] p-3.5 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#FFFFFF]">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#FFFFFF]" />
                    <span>Configurable USD → INR Conversion</span>
                  </span>
                  <span className="text-[11px] text-[#858585]">
                    Fallback Estimate · Updated {FALLBACK_EXCHANGE_RATE_UPDATED_AT}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label
                      htmlFor="smartpick-exchange-rate-input"
                      className="block text-[11px] text-[#B8B8B8] mb-1"
                    >
                      Estimated Rate (₹ per 1 USD)
                    </label>
                    <input
                      id="smartpick-exchange-rate-input"
                      type="number"
                      step="0.05"
                      min="1"
                      value={exchangeRateStr}
                      onChange={(e) => setExchangeRateStr(e.target.value)}
                      className="w-full rounded-lg bg-[#080808] border border-[#303030] px-3 py-1.5 text-xs font-mono-tabular text-[#FFFFFF] focus:outline-none focus:border-[#FFFFFF]"
                    />
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="block text-[11px] text-[#858585]">
                      Converted INR Amount
                    </span>
                    <span className="font-mono-tabular text-sm font-bold text-[#FFFFFF]">
                      {formatINR(effectiveAmountINR)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#858585] leading-relaxed">
                  Live market FX feed is not connected; using configurable fallback estimate ({formatINR(activeExchangeRate)} per 1 USD, last updated {FALLBACK_EXCHANGE_RATE_UPDATED_AT}). All reward calculations use the converted INR value.
                </p>
              </div>
            )}

            {!isValidAmount && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-[#1C1C1C] border border-[#FFFFFF] text-xs text-[#FFFFFF]"
              >
                Please enter a purchase amount greater than ₹0.00 to calculate estimated rewards.
              </div>
            )}
          </div>

          <div className="pt-5 mt-5 border-t border-[#303030] flex items-start gap-2 text-xs text-[#858585]">
            <Info className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" />
            <span>
              Formula: <code className="font-mono-tabular text-[#FFFFFF]">INR Amount × (Reward Rate ÷ 100)</code>. Estimates are formatted in Indian Rupees (₹) based on your configured card reward rates.
            </span>
          </div>
        </section>

        {/* Right: Recommended Card Result */}
        <section className="lg:col-span-7 rounded-2xl bg-[#151515] border border-[#303030] p-6 flex flex-col justify-between">
          {recommended && isValidAmount ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#303030]">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8B8B8]">
                    <Award className="w-4 h-4 text-[#FFFFFF]" />
                    <span>Recommended Card</span>
                  </div>
                  <h2
                    data-testid="smartpick-recommended-card"
                    className="text-2xl sm:text-3xl font-bold text-[#FFFFFF] mt-1"
                  >
                    {recommended.card.nickname}
                  </h2>
                  <p className="text-xs text-[#B8B8B8] mt-0.5">
                    {recommended.card.issuer} · {recommended.card.network} · •••• {recommended.card.lastFour} ·{' '}
                    {recommended.card.tagline}
                  </p>
                </div>

                <div className="text-left sm:text-right bg-[#1C1C1C] border border-[#303030] rounded-xl px-4 py-3">
                  <span className="block text-xs text-[#858585]">
                    Estimated Reward
                  </span>
                  <span
                    data-testid="smartpick-estimated-reward"
                    className="font-mono-tabular text-2xl font-bold text-[#FFFFFF]"
                  >
                    {formatINR(recommended.estimatedReward)}
                  </span>
                  <span className="block font-mono-tabular text-xs text-[#B8B8B8] font-semibold mt-0.5">
                    {recommended.appliedRate.toFixed(1)}% Reward Rate
                  </span>
                </div>
              </div>

              {/* Formula & Short Explanation */}
              <div className="rounded-xl bg-[#1C1C1C] border border-[#303030] p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#B8B8B8]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#FFFFFF]">
                    <Calculator className="w-3.5 h-3.5 text-[#FFFFFF]" />
                    Reward Calculation (INR)
                  </span>
                  <span className="font-mono-tabular text-[#FFFFFF]">
                    {recommended.formulaText}
                  </span>
                </div>
                <p className="text-sm text-[#B8B8B8] leading-relaxed">
                  {recommended.explanation}
                  {runnerUp && evaluation.extraGainVsRunnerUp > 0 && (
                    <span className="text-[#FFFFFF]">
                      {' '}
                      Choosing {recommended.card.nickname} earns{' '}
                      <strong className="font-mono-tabular">
                        {formatINR(evaluation.extraGainVsRunnerUp)}
                      </strong>{' '}
                      more in rewards than {runnerUp.card.nickname} (
                      {runnerUp.appliedRate.toFixed(1)}%).
                    </span>
                  )}
                </p>
              </div>

              {/* Optional Server-Side AI Explanation */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRequestAiInsight}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1C1C1C] border border-[#303030] hover:bg-[#252525] hover:border-[#FFFFFF] text-xs font-semibold text-[#FFFFFF] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFFFFF]" />
                    <span>
                      {aiLoading ? 'Generating AI Explanation...' : 'Explain with Smart Pick AI'}
                    </span>
                  </button>

                  {onLogSimulatedPurchase && (
                    <button
                      type="button"
                      onClick={handleLogPurchase}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E5E5] text-xs font-semibold text-[#080808] transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#080808]" />
                      <span>Log to Expenses</span>
                    </button>
                  )}

                  {loggedSuccess && (
                    <span className="text-xs text-[#FFFFFF]">
                      Added to Expenses!
                    </span>
                  )}
                </div>

                {aiInsight && (
                  <div
                    data-testid="smartpick-ai-insight"
                    className="rounded-xl bg-[#1C1C1C] border border-[#FFFFFF] p-4 text-xs text-[#FFFFFF] leading-relaxed"
                  >
                    <div className="text-[11px] font-semibold text-[#B8B8B8] mb-1">
                      Smart Pick AI Commentary
                    </div>
                    {aiInsight}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-[#858585]">
              Enter a positive purchase amount in ₹ to see your recommended card.
            </div>
          )}

          {/* Ranked Comparison Table Across All Cards */}
          <div className="mt-6 pt-5 border-t border-[#303030]">
            <h3 className="text-xs font-semibold text-[#858585] mb-3">
              All Cards Ranked for {category}
            </h3>
            <div className="space-y-2">
              {evaluation.rankedCards.map((item, idx) => (
                <div
                  key={item.card.id}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${
                    idx === 0
                      ? 'bg-[#1C1C1C] border-[#FFFFFF]'
                      : 'bg-[#080808] border-[#303030]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tabular text-xs font-bold text-[#858585]">
                      0{idx + 1}.
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-[#FFFFFF]">
                        {item.card.nickname}
                      </span>
                      <span className="text-xs text-[#858585] ml-2">
                        {item.card.issuer} · {item.card.network} •••• {item.card.lastFour}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono-tabular">
                    <span className="text-xs text-[#B8B8B8]">
                      {item.appliedRate.toFixed(1)}% rate
                    </span>
                    <span className="text-sm font-bold text-[#FFFFFF]">
                      {formatINR(item.estimatedReward)}
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
