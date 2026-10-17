/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Sparkles,
  ReceiptText,
  Tag,
  CalendarClock,
  Eye,
  EyeOff,
  LogOut,
  Loader2,
} from 'lucide-react';
import {
  INITIAL_DEMO_CARDS,
  INITIAL_DEMO_TRANSACTIONS,
  INITIAL_SAMPLE_OFFERS,
  INITIAL_DEMO_BILLS,
  DemoCard,
  Transaction,
  SampleOffer,
  DemoBill,
  PurchaseCategory,
  calculateBillsSummary,
} from './utils/finance';
import {
  AuthSession,
  FirestoreUserProfileRecord,
  FirestoreLoginActivityRecord,
  clearLegacyLocalStorageAuth,
} from './utils/auth';
import {
  auth,
  onAuthStateChanged,
  signOutFromFirebase,
  subscribeToUserProfile,
  subscribeToUserLoginActivity,
} from './firebase';
import { PerqLogo } from './components/PerqLogo';
import { AuthView } from './components/AuthView';
import { DashboardView, NavTab } from './components/DashboardView';
import { WalletView } from './components/WalletView';
import { SmartPickView } from './components/SmartPickView';
import { ExpensesView } from './components/ExpensesView';
import { OffersView } from './components/OffersView';
import { BillsView } from './components/BillsView';
import { AddCardModal } from './components/AddCardModal';

const NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'smart-pick', label: 'Smart Pick', icon: Sparkles },
  { id: 'expenses', label: 'Expenses', icon: ReceiptText },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'bills', label: 'Bills', icon: CalendarClock },
];

export default function App() {
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfileRecord | null>(null);
  const [loginActivities, setLoginActivities] = useState<FirestoreLoginActivityRecord[]>([]);
  const isRegisteringRef = useRef<boolean>(false);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [cards, setCards] = useState<DemoCard[]>(INITIAL_DEMO_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string>(INITIAL_DEMO_CARDS[0].id);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_DEMO_TRANSACTIONS);
  const [offers] = useState<SampleOffer[]>(INITIAL_SAMPLE_OFFERS);
  const [bills, setBills] = useState<DemoBill[]>(INITIAL_DEMO_BILLS);
  const [hideBalances, setHideBalances] = useState<boolean>(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState<boolean>(false);

  // Smart Pick prefill when jumping from an Offer
  const [smartPickPreset, setSmartPickPreset] = useState<{
    merchant: string;
    category: PurchaseCategory;
    amount: string;
  }>({
    merchant: 'Whole Foods Market',
    category: 'Groceries',
    amount: '2500.00',
  });

  // Purge any legacy localStorage password keys on startup and subscribe to Firebase Auth
  useEffect(() => {
    clearLegacyLocalStorageAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (isRegisteringRef.current) {
        return;
      }

      if (firebaseUser && firebaseUser.email) {
        const userUid = firebaseUser.uid;
        const userEmail = firebaseUser.email.toLowerCase();
        const fallbackDisplayName =
          firebaseUser.displayName || userEmail.split('@')[0] || 'PERQ Member';
        setAuthSession((prev) => ({
          uid: userUid,
          fullName:
            prev?.uid === userUid && prev.fullName
              ? prev.fullName
              : fallbackDisplayName,
          email: userEmail,
          status: 'active',
        }));
      } else {
        setAuthSession(null);
        setUserProfile(null);
        setLoginActivities([]);
      }
      setAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to real Firestore `users/{uid}` and `loginActivity` records when authenticated
  useEffect(() => {
    if (!authReady || !authSession?.uid || isRegisteringRef.current) {
      return;
    }

    const unsubProfile = subscribeToUserProfile(authSession.uid, (profile) => {
      setUserProfile(profile);
      if (profile) {
        setAuthSession((prev) =>
          prev
            ? {
                ...prev,
                fullName: profile.name || prev.fullName,
                email: profile.email || prev.email,
                status: profile.status,
                createdAt: profile.createdAt,
                lastLoginAt: profile.lastLoginAt,
              }
            : null
        );
      }
    });

    const unsubActivity = subscribeToUserLoginActivity(authSession.uid, (records) => {
      setLoginActivities(records);
    });

    return () => {
      unsubProfile();
      unsubActivity();
    };
  }, [authReady, authSession?.uid]);

  const handleRegistrationStateChange = (isRegistering: boolean) => {
    isRegisteringRef.current = isRegistering;
  };

  const handleAuthenticated = (session: AuthSession) => {
    setAuthSession(session);
  };

  const handleSignOut = async () => {
    await signOutFromFirebase();
    setAuthSession(null);
    setUserProfile(null);
    setLoginActivities([]);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#080808] text-[#FFFFFF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-[#B8B8B8]">
          <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
          <span>Connecting to PERQ Firebase Authentication...</span>
        </div>
      </div>
    );
  }

  // Secure the application entry point when not authenticated
  if (!authSession) {
    return (
      <AuthView
        onRegistrationStateChange={handleRegistrationStateChange}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  const selectedCard =
    cards.find((c) => c.id === selectedCardId) || cards[0] || INITIAL_DEMO_CARDS[0];

  const billsSummary = calculateBillsSummary(bills);

  const handleAddCard = (newCard: DemoCard) => {
    setCards((prev) => [...prev, newCard]);
    setSelectedCardId(newCard.id);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => {
      const remaining = prev.filter((c) => c.id !== cardId);
      if (selectedCardId === cardId && remaining.length > 0) {
        setSelectedCardId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  const handleAddBill = (newBill: Omit<DemoBill, 'id'>) => {
    const bill: DemoBill = {
      ...newBill,
      id: `bill-${Date.now()}`,
    };
    setBills((prev) => [bill, ...prev]);
  };

  const handleToggleBillPaid = (billId: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId
          ? { ...b, status: b.status === 'paid' ? 'pending' : 'paid' }
          : b
      )
    );
  };

  const handleSimulateOffer = (offer: SampleOffer) => {
    setSmartPickPreset({
      merchant: offer.merchant,
      category: offer.category,
      amount: String((offer.sampleSpendINR || 2500).toFixed(2)),
    });
    setActiveTab('smart-pick');
  };

  const currentTabLabel =
    NAV_ITEMS.find((item) => item.id === activeTab)?.label || 'Home';

  return (
    <div className="min-h-screen bg-[#080808] text-[#FFFFFF] flex flex-col md:flex-row">
      {/* Desktop Compact Sidebar */}
      <aside
        aria-label="Primary Sidebar Navigation"
        className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#111111] border-r border-[#303030] z-20"
      >
        <div className="p-6 border-b border-[#303030]">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="text-left focus-visible:outline-none cursor-pointer"
          >
            <PerqLogo size="md" showText showTagline />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#080808] font-semibold'
                    : 'text-[#B8B8B8] hover:text-[#FFFFFF] hover:bg-[#252525]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#080808]' : 'text-[#858585]'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {item.id === 'bills' && billsSummary.pendingCount > 0 && (
                  <span
                    className={`font-mono-tabular text-xs ${
                      isActive ? 'text-[#080808] font-bold' : 'text-[#858585]'
                    }`}
                  >
                    {billsSummary.pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Signed-In User & Firestore Profile Status Box in Sidebar Footer */}
        <div className="p-4 m-3 rounded-xl bg-[#151515] border border-[#303030] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div
                data-testid="sidebar-user-fullname"
                className="text-xs font-semibold text-[#FFFFFF] truncate"
              >
                {userProfile?.name || authSession.fullName}
              </div>
              <div
                data-testid="sidebar-user-email"
                className="text-[11px] text-[#858585] truncate"
              >
                {userProfile?.email || authSession.email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out of PERQ"
              title="Sign out"
              className="p-1.5 rounded-lg bg-[#1C1C1C] border border-[#303030] text-[#B8B8B8] hover:text-[#FFFFFF] hover:bg-[#252525] transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2.5 border-t border-[#303030]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#FFFFFF]">
              <span>My Account</span>
              <span className="font-mono-tabular text-[10px] text-[#B8B8B8]">
                {loginActivities.length} login{loginActivities.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-[10px] text-[#858585] mt-0.5 leading-relaxed">
              Firebase Auth &amp; Cloud Firestore synced ({userProfile?.status || 'active'}).
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Top Bar Contract: Breadcrumb / Brand on Left, Balance Privacy & Sign Out on Right */}
        <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5 bg-[#080808] border-b border-[#303030]">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <PerqLogo size="sm" showText />
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-[#858585]">
              <span>PERQ</span>
              <span aria-hidden="true">/</span>
              <span className="text-[#FFFFFF] font-medium">{currentTabLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setHideBalances((prev) => !prev)}
              aria-label={hideBalances ? 'Show all balances' : 'Hide all balances'}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#151515] border border-[#303030] hover:bg-[#252525] text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {hideBalances ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#FFFFFF]" />
                  <span>Balances Hidden</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#B8B8B8]" />
                  <span>Hide Balances</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              data-testid="header-signout-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151515] border border-[#303030] hover:bg-[#252525] text-xs font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Active View Container */}
        <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {activeTab === 'home' && (
            <DashboardView
              userFullName={userProfile?.name || authSession.fullName}
              userProfile={userProfile}
              loginActivities={loginActivities}
              cards={cards}
              selectedCard={selectedCard}
              onSelectCard={(card) => setSelectedCardId(card.id)}
              transactions={transactions}
              offers={offers}
              bills={bills}
              hideBalances={hideBalances}
              onToggleHideBalances={() => setHideBalances((prev) => !prev)}
              onOpenAddCard={() => setIsAddCardOpen(true)}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletView
              userFullName={userProfile?.name || authSession.fullName}
              cards={cards}
              selectedCard={selectedCard}
              onSelectCard={(card) => setSelectedCardId(card.id)}
              hideBalances={hideBalances}
              onToggleHideBalances={() => setHideBalances((prev) => !prev)}
              onOpenAddCard={() => setIsAddCardOpen(true)}
              onDeleteCard={handleDeleteCard}
            />
          )}

          {activeTab === 'smart-pick' && (
            <SmartPickView
              cards={cards}
              initialMerchant={smartPickPreset.merchant}
              initialCategory={smartPickPreset.category}
              initialAmount={smartPickPreset.amount}
              onLogSimulatedPurchase={(tx) =>
                handleAddTransaction({
                  ...tx,
                  date: new Date().toISOString().slice(0, 10),
                })
              }
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              transactions={transactions}
              cards={cards}
              hideBalances={hideBalances}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'offers' && (
            <OffersView
              offers={offers}
              onSimulateOffer={handleSimulateOffer}
            />
          )}

          {activeTab === 'bills' && (
            <BillsView
              bills={bills}
              cards={cards}
              hideBalances={hideBalances}
              onAddBill={handleAddBill}
              onToggleBillPaid={handleToggleBillPaid}
            />
          )}
        </main>

        {/* Quiet Prototype Disclaimer Footer */}
        <footer className="px-4 sm:px-8 py-5 border-t border-[#303030] text-xs text-[#858585] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <strong className="text-[#FFFFFF] font-semibold">PERQ</strong> — Smarter Cards. Bigger Rewards.
          </div>
          <div>
            Interactive Fintech Workspace · Firebase Auth &amp; Cloud Firestore Connected
          </div>
        </footer>
      </div>

      {/* Mobile Compact Bottom Navigation (<= 56px height to respect 15% mobile sticky cap) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-[#111111] border-t border-[#303030] z-30 grid grid-cols-6 px-1"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors rounded-lg my-1 ${
                isActive
                  ? 'bg-[#FFFFFF] text-[#080808] font-semibold'
                  : 'text-[#858585] hover:text-[#FFFFFF]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-full px-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        onAddCard={handleAddCard}
      />
    </div>
  );
}
