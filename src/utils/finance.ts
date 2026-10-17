export type PurchaseCategory =
  | 'Dining'
  | 'Travel'
  | 'Groceries'
  | 'Shopping'
  | 'Entertainment'
  | 'Utilities'
  | 'General';

export const PURCHASE_CATEGORIES: PurchaseCategory[] = [
  'Dining',
  'Travel',
  'Groceries',
  'Shopping',
  'Entertainment',
  'Utilities',
  'General',
];

export type BankIssuer =
  | 'SBI'
  | 'HDFC Bank'
  | 'ICICI Bank'
  | 'Axis Bank'
  | 'Kotak Mahindra Bank'
  | 'American Express';

export const BANK_ISSUERS: BankIssuer[] = [
  'SBI',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'American Express',
];

export type CardFinishPreset = 'matte' | 'metallic' | 'satin';

export type PaymentNetwork = 'Visa' | 'Mastercard' | 'Amex';

export type CurrencyCode = 'INR' | 'USD';

export interface ExchangeRateConfig {
  rate: number;
  lastUpdated: string;
  isFallbackEstimate: boolean;
}

export const DEFAULT_USD_TO_INR_FALLBACK_RATE = 84.5;
export const FALLBACK_EXCHANGE_RATE_UPDATED_AT = '2026-10-17';

export const DEFAULT_EXCHANGE_RATE_CONFIG: ExchangeRateConfig = {
  rate: DEFAULT_USD_TO_INR_FALLBACK_RATE,
  lastUpdated: FALLBACK_EXCHANGE_RATE_UPDATED_AT,
  isFallbackEstimate: true,
};

export const FREE_PLAN_CARD_LIMIT = 4;

export interface BankThemeSpec {
  issuer: BankIssuer;
  shortLabel: string;
  faceGradient: [string, string, string];
  headerBandColor: string;
  accentColor: string;
  subtleDetailColor: string;
  coreHex: number;
  bezelHex: number;
  shieldHex: number;
  coilHex: number;
  cardTailwindBg: string;
  cardTailwindBorder: string;
  badgeColor: string;
  defaultFinish: CardFinishPreset;
}

export const BANK_THEMES: Record<BankIssuer, BankThemeSpec> = {
  SBI: {
    issuer: 'SBI',
    shortLabel: 'SBI Card',
    faceGradient: ['#0D3B8E', '#092B68', '#051A42'],
    headerBandColor: '#1E64D8',
    accentColor: '#38BDF8',
    subtleDetailColor: 'rgba(125, 211, 252, 0.16)',
    coreHex: 0x0b357d,
    bezelHex: 0x7dd3fc,
    shieldHex: 0x072252,
    coilHex: 0xbae6fd,
    cardTailwindBg: 'bg-gradient-to-br from-[#0D3B8E] via-[#092B68] to-[#051A42]',
    cardTailwindBorder: 'border-[#1E64D8]/60 hover:border-[#7DD3FC]',
    badgeColor: '#00A9E0',
    defaultFinish: 'satin',
  },
  'HDFC Bank': {
    issuer: 'HDFC Bank',
    shortLabel: 'HDFC Bank',
    faceGradient: ['#0B1F47', '#081736', '#050E24'],
    headerBandColor: '#E31837',
    accentColor: '#E31837',
    subtleDetailColor: 'rgba(227, 24, 55, 0.18)',
    coreHex: 0x0b1f47,
    bezelHex: 0xd4dde8,
    shieldHex: 0x162c5c,
    coilHex: 0xe31837,
    cardTailwindBg: 'bg-gradient-to-br from-[#0B1F47] via-[#081736] to-[#050E24]',
    cardTailwindBorder: 'border-[#254580]/70 hover:border-[#E31837]',
    badgeColor: '#E31837',
    defaultFinish: 'metallic',
  },
  'ICICI Bank': {
    issuer: 'ICICI Bank',
    shortLabel: 'ICICI Bank',
    faceGradient: ['#4A1810', '#2E100C', '#180907'],
    headerBandColor: '#F37021',
    accentColor: '#F37021',
    subtleDetailColor: 'rgba(243, 112, 33, 0.18)',
    coreHex: 0x45160e,
    bezelHex: 0xf59e0b,
    shieldHex: 0x290d09,
    coilHex: 0xf37021,
    cardTailwindBg: 'bg-gradient-to-br from-[#4A1810] via-[#2E100C] to-[#180907]',
    cardTailwindBorder: 'border-[#8C321E]/70 hover:border-[#F37021]',
    badgeColor: '#F37021',
    defaultFinish: 'satin',
  },
  'Axis Bank': {
    issuer: 'Axis Bank',
    shortLabel: 'Axis Bank',
    faceGradient: ['#4A1026', '#290B17', '#14070D'],
    headerBandColor: '#97144D',
    accentColor: '#D83B78',
    subtleDetailColor: 'rgba(151, 20, 77, 0.22)',
    coreHex: 0x3d0d20,
    bezelHex: 0xe2c6d1,
    shieldHex: 0x240813,
    coilHex: 0xc22565,
    cardTailwindBg: 'bg-gradient-to-br from-[#4A1026] via-[#290B17] to-[#14070D]',
    cardTailwindBorder: 'border-[#7A1640]/70 hover:border-[#D83B78]',
    badgeColor: '#97144D',
    defaultFinish: 'matte',
  },
  'Kotak Mahindra Bank': {
    issuer: 'Kotak Mahindra Bank',
    shortLabel: 'Kotak',
    faceGradient: ['#182030', '#111724', '#0A0E17'],
    headerBandColor: '#ED1C24',
    accentColor: '#ED1C24',
    subtleDetailColor: 'rgba(237, 28, 36, 0.18)',
    coreHex: 0x182030,
    bezelHex: 0xe2e8f0,
    shieldHex: 0x0f1522,
    coilHex: 0xed1c24,
    cardTailwindBg: 'bg-gradient-to-br from-[#182030] via-[#111724] to-[#0A0E17]',
    cardTailwindBorder: 'border-[#334155]/70 hover:border-[#ED1C24]',
    badgeColor: '#ED1C24',
    defaultFinish: 'satin',
  },
  'American Express': {
    issuer: 'American Express',
    shortLabel: 'Amex',
    faceGradient: ['#0D355C', '#082440', '#051629'],
    headerBandColor: '#006FCF',
    accentColor: '#60A5FA',
    subtleDetailColor: 'rgba(96, 165, 250, 0.18)',
    coreHex: 0x0d355c,
    bezelHex: 0xe2e8f0,
    shieldHex: 0x08223d,
    coilHex: 0x60a5fa,
    cardTailwindBg: 'bg-gradient-to-br from-[#0D355C] via-[#082440] to-[#051629]',
    cardTailwindBorder: 'border-[#1E568F]/70 hover:border-[#60A5FA]',
    badgeColor: '#006FCF',
    defaultFinish: 'metallic',
  },
};

export interface DemoCard {
  id: string;
  nickname: string;
  issuer: BankIssuer;
  network: PaymentNetwork;
  lastFour: string;
  balance: number; // Denominated natively in INR (₹)
  currency?: 'INR';
  baseRewardRate: number;
  categoryRates: Partial<Record<PurchaseCategory, number>>;
  finish: CardFinishPreset;
  tagline: string;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: PurchaseCategory;
  amount: number; // Denominated in INR (₹)
  originalUsdAmount?: number;
  appliedExchangeRate?: number;
  exchangeRateUpdatedAt?: string;
  date: string;
  cardNickname: string;
  sampleRewardRate: number;
}

export interface SampleOffer {
  id: string;
  merchant: string;
  discountLabel: string;
  category: PurchaseCategory;
  distanceLabel: string;
  distanceMiles: number;
  recommendedCard: string;
  sampleTerms: string;
  sampleSpendINR?: number;
}

export interface DemoBill {
  id: string;
  name: string;
  amount: number; // Denominated in INR (₹)
  dueDate: string;
  category: PurchaseCategory;
  status: 'pending' | 'paid';
  autopayCard: string;
}

export interface CardComparisonItem {
  card: DemoCard;
  appliedRate: number;
  estimatedReward: number;
  formulaText: string;
  explanation: string;
}

export interface SmartPickEvaluation {
  merchantName: string;
  amount: number; // Always evaluated in INR (₹)
  category: PurchaseCategory;
  recommended: CardComparisonItem | null;
  runnerUp: CardComparisonItem | null;
  rankedCards: CardComparisonItem[];
  extraGainVsRunnerUp: number;
}

export const INITIAL_DEMO_CARDS: DemoCard[] = [
  {
    id: 'card-aurora',
    nickname: 'Aurora',
    issuer: 'SBI',
    network: 'Visa',
    lastFour: '4829',
    balance: 125000.0,
    currency: 'INR',
    baseRewardRate: 2.0,
    categoryRates: {
      Travel: 5.0,
      Dining: 3.5,
      Shopping: 2.5,
      Groceries: 2.0,
      Entertainment: 2.0,
      Utilities: 1.5,
      General: 2.0,
    },
    finish: 'satin',
    tagline: '5% Travel & 3.5% Dining',
  },
  {
    id: 'card-spectrum',
    nickname: 'Spectrum',
    issuer: 'HDFC Bank',
    network: 'Mastercard',
    lastFour: '9104',
    balance: 64500.0,
    currency: 'INR',
    baseRewardRate: 3.0,
    categoryRates: {
      Groceries: 4.5,
      Dining: 4.0,
      Entertainment: 3.5,
      Shopping: 2.5,
      Travel: 2.0,
      Utilities: 2.5,
      General: 3.0,
    },
    finish: 'metallic',
    tagline: '4.5% Groceries & 4% Dining',
  },
  {
    id: 'card-obsidian',
    nickname: 'Obsidian',
    issuer: 'American Express',
    network: 'Amex',
    lastFour: '7731',
    balance: 185000.0,
    currency: 'INR',
    baseRewardRate: 2.5,
    categoryRates: {
      Shopping: 5.0,
      Entertainment: 4.5,
      Travel: 3.5,
      Utilities: 3.0,
      Dining: 2.5,
      Groceries: 2.5,
      General: 2.5,
    },
    finish: 'metallic',
    tagline: '5% Shopping & 4.5% Entertainment',
  },
  {
    id: 'card-coral',
    nickname: 'Coral',
    issuer: 'ICICI Bank',
    network: 'Visa',
    lastFour: '6318',
    balance: 42800.5,
    currency: 'INR',
    baseRewardRate: 2.0,
    categoryRates: {
      Dining: 4.2,
      Entertainment: 4.0,
      Utilities: 3.2,
      Groceries: 2.5,
      Travel: 2.5,
      Shopping: 2.5,
      General: 2.0,
    },
    finish: 'satin',
    tagline: '4.2% Dining & 3.2% Utilities',
  },
  {
    id: 'card-magnus',
    nickname: 'Magnus',
    issuer: 'Axis Bank',
    network: 'Mastercard',
    lastFour: '5042',
    balance: 95200.0,
    currency: 'INR',
    baseRewardRate: 2.2,
    categoryRates: {
      Travel: 4.8,
      Shopping: 4.2,
      Dining: 3.5,
      Entertainment: 3.0,
      Groceries: 2.2,
      Utilities: 2.0,
      General: 2.2,
    },
    finish: 'matte',
    tagline: '4.8% Travel & 4.2% Shopping',
  },
  {
    id: 'card-zenith',
    nickname: 'Zenith',
    issuer: 'Kotak Mahindra Bank',
    network: 'Visa',
    lastFour: '8295',
    balance: 28500.0,
    currency: 'INR',
    baseRewardRate: 2.0,
    categoryRates: {
      Groceries: 4.0,
      Utilities: 3.8,
      Shopping: 3.0,
      Dining: 2.5,
      Travel: 2.5,
      Entertainment: 2.5,
      General: 2.0,
    },
    finish: 'satin',
    tagline: '4.0% Groceries & 3.8% Utilities',
  },
];

export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    merchant: 'Skyline Airlines',
    category: 'Travel',
    amount: 12500.0,
    date: '2026-10-15',
    cardNickname: 'Aurora',
    sampleRewardRate: 5.0,
  },
  {
    id: 'tx-2',
    merchant: 'Verde Market Grocer',
    category: 'Groceries',
    amount: 2450.0,
    date: '2026-10-14',
    cardNickname: 'Spectrum',
    sampleRewardRate: 4.5,
  },
  {
    id: 'tx-3',
    merchant: 'Atelier Mono Studio',
    category: 'Shopping',
    amount: 8500.0,
    date: '2026-10-13',
    cardNickname: 'Obsidian',
    sampleRewardRate: 5.0,
  },
  {
    id: 'tx-4',
    merchant: 'Osteria Nove Kitchen',
    category: 'Dining',
    amount: 1850.0,
    date: '2026-10-12',
    cardNickname: 'Coral',
    sampleRewardRate: 4.2,
  },
  {
    id: 'tx-5',
    merchant: 'Metro Fiber Grid',
    category: 'Utilities',
    amount: 500.0,
    date: '2026-10-10',
    cardNickname: 'Zenith',
    sampleRewardRate: 3.8,
  },
];

export const INITIAL_SAMPLE_OFFERS: SampleOffer[] = [
  {
    id: 'off-1',
    merchant: 'Blue Bottle Roasters',
    discountLabel: '8% Cashback',
    category: 'Dining',
    distanceLabel: '0.5 km away',
    distanceMiles: 0.3,
    recommendedCard: 'Coral',
    sampleTerms: 'Illustrative offer on specialty coffee & bakery orders above ₹500.00.',
    sampleSpendINR: 1200,
  },
  {
    id: 'off-2',
    merchant: 'Harvest Organic Co-op',
    discountLabel: '10% Reward Boost',
    category: 'Groceries',
    distanceLabel: '1.0 km away',
    distanceMiles: 0.6,
    recommendedCard: 'Spectrum',
    sampleTerms: 'Simulated neighborhood grocery reward multiplier on orders up to ₹5,000.00.',
    sampleSpendINR: 2500,
  },
  {
    id: 'off-3',
    merchant: 'Veloce Transit & Air',
    discountLabel: '₹1,500 Credit on ₹15,000+',
    category: 'Travel',
    distanceLabel: '1.9 km away',
    distanceMiles: 1.2,
    recommendedCard: 'Aurora',
    sampleTerms: 'Illustrative travel perk for reward calculation on domestic bookings.',
    sampleSpendINR: 15000,
  },
  {
    id: 'off-4',
    merchant: 'Lumen Design House',
    discountLabel: '12% Cashback',
    category: 'Shopping',
    distanceLabel: '1.3 km away',
    distanceMiles: 0.8,
    recommendedCard: 'Obsidian',
    sampleTerms: 'Illustrative retail showcase discount—not a live merchant offer.',
    sampleSpendINR: 8500,
  },
  {
    id: 'off-5',
    merchant: 'Aether Cinema IMAX',
    discountLabel: '15% Ticket Rebate',
    category: 'Entertainment',
    distanceLabel: '2.4 km away',
    distanceMiles: 1.5,
    recommendedCard: 'Obsidian',
    sampleTerms: 'Simulated entertainment cashback for evening screenings.',
    sampleSpendINR: 1500,
  },
  {
    id: 'off-6',
    merchant: 'Solis EV Supercharger',
    discountLabel: '6% Charging Credit',
    category: 'Utilities',
    distanceLabel: '0.6 km away',
    distanceMiles: 0.4,
    recommendedCard: 'Zenith',
    sampleTerms: 'Simulated utility & EV charging reward offer.',
    sampleSpendINR: 950,
  },
];

export const INITIAL_DEMO_BILLS: DemoBill[] = [
  {
    id: 'bill-1',
    name: 'Metro Fiber Gigabit Internet',
    amount: 1499.0,
    dueDate: '2026-10-21',
    category: 'Utilities',
    status: 'pending',
    autopayCard: 'Zenith',
  },
  {
    id: 'bill-2',
    name: 'Apex Cloud & Media Bundle',
    amount: 500.0,
    dueDate: '2026-10-24',
    category: 'Entertainment',
    status: 'pending',
    autopayCard: 'Obsidian',
  },
  {
    id: 'bill-3',
    name: 'City Power Grid Electric',
    amount: 3250.0,
    dueDate: '2026-10-28',
    category: 'Utilities',
    status: 'pending',
    autopayCard: 'Spectrum',
  },
  {
    id: 'bill-4',
    name: 'Equinox Studio Membership',
    amount: 4500.0,
    dueDate: '2026-10-08',
    category: 'General',
    status: 'paid',
    autopayCard: 'Aurora',
  },
];

export function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const inrNumberFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Centralized Indian Rupee (₹) formatter using Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).
 * Formats numbers using the Indian numbering system (thousands, lakhs, crores), e.g.:
 * - 500 -> ₹500.00
 * - 12500 -> ₹12,500.00
 * - 125000 -> ₹1,25,000.00
 */
export function formatINR(amount: number, hideBalances = false): string {
  if (hideBalances) {
    return '••••••';
  }
  const safe = Number.isFinite(amount) ? amount : 0;
  return inrNumberFormatter.format(safe);
}

export const formatCurrency = formatINR;

/**
 * Converts a genuine USD amount to INR using a configurable exchange rate.
 * Never converts an amount that is already denominated in INR.
 */
export function convertUsdToInr(
  usdAmount: number,
  customRate?: number,
  lastUpdated = FALLBACK_EXCHANGE_RATE_UPDATED_AT
): {
  inrAmount: number;
  appliedRate: number;
  lastUpdated: string;
  isFallbackEstimate: boolean;
} {
  const cleanUsd = Number.isFinite(usdAmount) && usdAmount > 0 ? usdAmount : 0;
  const validCustomRate =
    typeof customRate === 'number' && Number.isFinite(customRate) && customRate > 0
      ? customRate
      : DEFAULT_USD_TO_INR_FALLBACK_RATE;

  return {
    inrAmount: roundCents(cleanUsd * validCustomRate),
    appliedRate: roundCents(validCustomRate),
    lastUpdated,
    isFallbackEstimate: true,
  };
}

/**
 * Ensures any monetary input is normalized to INR without double-converting values already in INR.
 */
export function normalizeToINR(
  amount: number,
  currency: CurrencyCode = 'INR',
  exchangeRate = DEFAULT_USD_TO_INR_FALLBACK_RATE
): number {
  const safe = Number.isFinite(amount) && amount > 0 ? amount : 0;
  if (currency === 'INR') {
    return roundCents(safe);
  }
  return convertUsdToInr(safe, exchangeRate).inrAmount;
}

export function calculateTotalWalletBalance(cards: DemoCard[]): number {
  const sum = cards.reduce(
    (acc, card) => acc + (Number.isFinite(card.balance) ? card.balance : 0),
    0
  );
  return roundCents(sum);
}

export function getCardRateForCategory(card: DemoCard, category: PurchaseCategory): number {
  const specific = card.categoryRates?.[category];
  if (typeof specific === 'number' && Number.isFinite(specific)) {
    return specific;
  }
  return card.baseRewardRate;
}

export function evaluateSmartPick(
  cards: DemoCard[],
  amountINR: number,
  category: PurchaseCategory,
  merchantName: string
): SmartPickEvaluation {
  const cleanAmount = Number.isFinite(amountINR) && amountINR > 0 ? roundCents(amountINR) : 0;
  const cleanMerchant = merchantName.trim() || 'Merchant';

  const rankedCards: CardComparisonItem[] = cards
    .map((card) => {
      const appliedRate = getCardRateForCategory(card, category);
      const estimatedReward = roundCents(cleanAmount * (appliedRate / 100));
      const formulaText = `${formatINR(cleanAmount)} × ${appliedRate.toFixed(1)}% = ${formatINR(
        estimatedReward
      )}`;
      const explanation = `${card.nickname} (${card.issuer} · ${card.network} •••• ${
        card.lastFour
      }) earns a ${appliedRate.toFixed(1)}% reward rate on ${category}, yielding an estimated ${formatINR(
        estimatedReward
      )} reward at ${cleanMerchant}.`;
      return {
        card,
        appliedRate,
        estimatedReward,
        formulaText,
        explanation,
      };
    })
    .sort((a, b) => {
      if (b.estimatedReward !== a.estimatedReward) {
        return b.estimatedReward - a.estimatedReward;
      }
      return b.appliedRate - a.appliedRate;
    });

  const recommended = rankedCards[0] || null;
  const runnerUp = rankedCards[1] || null;
  const extraGainVsRunnerUp =
    recommended && runnerUp
      ? roundCents(recommended.estimatedReward - runnerUp.estimatedReward)
      : 0;

  return {
    merchantName: cleanMerchant,
    amount: cleanAmount,
    category,
    recommended,
    runnerUp,
    rankedCards,
    extraGainVsRunnerUp,
  };
}

export function calculateExpenseSummary(transactions: Transaction[]): {
  totalSpending: number;
  estimatedSampleSavings: number;
  byCategory: Record<PurchaseCategory, number>;
} {
  const byCategory: Record<PurchaseCategory, number> = {
    Dining: 0,
    Travel: 0,
    Groceries: 0,
    Shopping: 0,
    Entertainment: 0,
    Utilities: 0,
    General: 0,
  };

  let totalSpending = 0;
  let estimatedSampleSavings = 0;

  for (const tx of transactions) {
    const amt = Number.isFinite(tx.amount) && tx.amount > 0 ? tx.amount : 0;
    const rate =
      Number.isFinite(tx.sampleRewardRate) && tx.sampleRewardRate > 0
        ? tx.sampleRewardRate
        : 2.0;
    totalSpending += amt;
    estimatedSampleSavings += amt * (rate / 100);
    if (byCategory[tx.category] !== undefined) {
      byCategory[tx.category] = roundCents(byCategory[tx.category] + amt);
    } else {
      byCategory.General = roundCents(byCategory.General + amt);
    }
  }

  return {
    totalSpending: roundCents(totalSpending),
    estimatedSampleSavings: roundCents(estimatedSampleSavings),
    byCategory,
  };
}

export function filterOffers(
  offers: SampleOffer[],
  searchQuery: string,
  categoryFilter: PurchaseCategory | 'All'
): SampleOffer[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return offers.filter((offer) => {
    const matchesCategory = categoryFilter === 'All' || offer.category === categoryFilter;
    const matchesSearch =
      !normalizedQuery ||
      offer.merchant.toLowerCase().includes(normalizedQuery) ||
      offer.discountLabel.toLowerCase().includes(normalizedQuery) ||
      offer.category.toLowerCase().includes(normalizedQuery) ||
      offer.recommendedCard.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesSearch;
  });
}

export function calculateBillsSummary(bills: DemoBill[]): {
  pendingCount: number;
  paidCount: number;
  pendingTotal: number;
  paidTotal: number;
} {
  let pendingCount = 0;
  let paidCount = 0;
  let pendingTotal = 0;
  let paidTotal = 0;

  for (const bill of bills) {
    const amt = Number.isFinite(bill.amount) && bill.amount > 0 ? bill.amount : 0;
    if (bill.status === 'pending') {
      pendingCount += 1;
      pendingTotal += amt;
    } else {
      paidCount += 1;
      paidTotal += amt;
    }
  }

  return {
    pendingCount,
    paidCount,
    pendingTotal: roundCents(pendingTotal),
    paidTotal: roundCents(paidTotal),
  };
}

export function sanitizeLastFour(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4);
  }
  return digits.padStart(4, '0');
}
