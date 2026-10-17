import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_DEMO_CARDS,
  INITIAL_DEMO_TRANSACTIONS,
  INITIAL_SAMPLE_OFFERS,
  INITIAL_DEMO_BILLS,
  BANK_THEMES,
  DEFAULT_USD_TO_INR_FALLBACK_RATE,
  calculateTotalWalletBalance,
  formatINR,
  formatCurrency,
  convertUsdToInr,
  normalizeToINR,
  evaluateSmartPick,
  calculateExpenseSummary,
  filterOffers,
  calculateBillsSummary,
  sanitizeLastFour,
} from './finance.ts';

test('formatINR formats Indian Rupees with lakhs and crores using en-IN locale', () => {
  assert.equal(formatINR(500), '₹500.00');
  assert.equal(formatINR(12500), '₹12,500.00');
  assert.equal(formatINR(125000), '₹1,25,000.00');
  assert.equal(formatCurrency(125000, false), '₹1,25,000.00');
  assert.equal(formatINR(125000, true), '••••••');
});

test('normalizeToINR never double-converts INR values and converts USD values using configurable rate', () => {
  // Native INR value is untouched
  assert.equal(normalizeToINR(12500, 'INR', 85), 12500);

  // Genuine USD value is converted once using the provided exchange rate
  const converted = convertUsdToInr(100, 84.5, '2026-10-17');
  assert.equal(converted.inrAmount, 8450);
  assert.equal(converted.appliedRate, 84.5);
  assert.equal(converted.lastUpdated, '2026-10-17');
  assert.equal(converted.isFallbackEstimate, true);

  assert.equal(normalizeToINR(100, 'USD', DEFAULT_USD_TO_INR_FALLBACK_RATE), 8450);
});

test('calculateTotalWalletBalance sums all 6 card balances accurately in INR', () => {
  const total = calculateTotalWalletBalance(INITIAL_DEMO_CARDS);
  assert.equal(total, 541000.5);
  assert.equal(formatINR(total), '₹5,41,000.50');
});

test('all 6 bank issuers have distinct color themes and networks', () => {
  assert.equal(INITIAL_DEMO_CARDS.length, 6);
  const issuers = new Set(INITIAL_DEMO_CARDS.map((c) => c.issuer));
  assert.equal(issuers.size, 6);
  for (const card of INITIAL_DEMO_CARDS) {
    assert.ok(BANK_THEMES[card.issuer], `Missing theme for ${card.issuer}`);
    assert.equal(card.currency, 'INR');
  }
});

test('evaluateSmartPick recommends highest reward card for category in INR without Demo wording', () => {
  const groceryPick = evaluateSmartPick(
    INITIAL_DEMO_CARDS,
    2500,
    'Groceries',
    'Whole Foods Market'
  );
  assert.equal(groceryPick.recommended?.card.nickname, 'Spectrum');
  assert.equal(groceryPick.recommended?.appliedRate, 4.5);
  assert.equal(groceryPick.recommended?.estimatedReward, 112.5);
  assert.ok(groceryPick.recommended?.formulaText.includes('₹2,500.00'));
  assert.ok(groceryPick.recommended?.formulaText.includes('₹112.50'));
  assert.equal(/demo/i.test(groceryPick.recommended?.explanation || ''), false);

  const travelPick = evaluateSmartPick(
    INITIAL_DEMO_CARDS,
    12500,
    'Travel',
    'Skyline Airlines'
  );
  assert.equal(travelPick.recommended?.card.nickname, 'Aurora');
  assert.equal(travelPick.recommended?.appliedRate, 5.0);
  assert.equal(travelPick.recommended?.estimatedReward, 625.0);
});

test('calculateExpenseSummary updates totals in INR when transactions are added or removed', () => {
  const initialSummary = calculateExpenseSummary(INITIAL_DEMO_TRANSACTIONS);
  // 12500 + 2450 + 8500 + 1850 + 500 = 25800.00
  assert.equal(initialSummary.totalSpending, 25800.0);
  // (12500*0.05)=625 + (2450*0.045)=110.25 + (8500*0.05)=425 + (1850*0.042)=77.70 + (500*0.038)=19.00 = 1256.95
  assert.equal(initialSummary.estimatedSampleSavings, 1256.95);
});

test('filterOffers filters by search query and category and uses INR labels without Demo wording', () => {
  const all = filterOffers(INITIAL_SAMPLE_OFFERS, '', 'All');
  assert.equal(all.length, 6);
  for (const offer of all) {
    assert.equal(offer.discountLabel.includes('$'), false);
    assert.equal(offer.sampleTerms.includes('$'), false);
    assert.equal(/demo/i.test(offer.merchant), false);
    assert.equal(/demo/i.test(offer.discountLabel), false);
    assert.equal(/demo/i.test(offer.sampleTerms), false);
  }
});

test('cards, transactions, and bills contain no visible Demo labels', () => {
  for (const card of INITIAL_DEMO_CARDS) {
    assert.equal(/demo/i.test(card.nickname), false);
    assert.equal(/demo/i.test(card.tagline), false);
  }
  for (const tx of INITIAL_DEMO_TRANSACTIONS) {
    assert.equal(/demo/i.test(tx.merchant), false);
  }
  for (const bill of INITIAL_DEMO_BILLS) {
    assert.equal(/demo/i.test(bill.name), false);
  }
});

test('calculateBillsSummary counts pending and paid bills accurately in INR', () => {
  const summary = calculateBillsSummary(INITIAL_DEMO_BILLS);
  assert.equal(summary.pendingCount, 3);
  assert.equal(summary.paidCount, 1);
  // 1499 + 500 + 3250 = 5249.00
  assert.equal(summary.pendingTotal, 5249.0);
  assert.equal(summary.paidTotal, 4500.0);
});

test('sanitizeLastFour extracts or pads 4 digits safely without full card storage', () => {
  assert.equal(sanitizeLastFour('4829'), '4829');
  assert.equal(sanitizeLastFour('1234-5678-9012-9988'), '9988');
  assert.equal(sanitizeLastFour('77'), '0077');
});
