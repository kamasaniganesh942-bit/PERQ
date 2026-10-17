import React, { useState } from 'react';
import { Search, MapPin, Navigation, Sparkles, Info } from 'lucide-react';
import {
  SampleOffer,
  PurchaseCategory,
  PURCHASE_CATEGORIES,
  filterOffers,
} from '../utils/finance';

interface OffersViewProps {
  offers: SampleOffer[];
  onSimulateOffer: (offer: SampleOffer) => void;
}

export const OffersView: React.FC<OffersViewProps> = ({
  offers,
  onSimulateOffer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PurchaseCategory | 'All'>('All');
  const [nearbyEnabled, setNearbyEnabled] = useState(false);

  const filteredOffers = filterOffers(offers, searchQuery, selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header & Opt-In Location Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-[#303030]">
        <div>
          <p className="text-xs text-[#858585]">Merchant Perks · Curated Directory</p>
          <h1 className="text-2xl font-bold text-[#FFFFFF] tracking-tight mt-1">
            Nearby Offers
          </h1>
          <p className="text-sm text-[#B8B8B8] mt-1">
            Explore merchant reward boosts and filter by category or distance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNearbyEnabled((prev) => !prev)}
          aria-pressed={nearbyEnabled}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer ${
            nearbyEnabled
              ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#080808] hover:bg-[#E5E5E5]'
              : 'bg-[#151515] border-[#303030] text-[#FFFFFF] hover:bg-[#252525]'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>
            {nearbyEnabled
              ? 'Nearby Search Enabled (0.5–2.4 km)'
              : 'Enable Nearby Search'}
          </span>
        </button>
      </div>

      {/* Transparency & Map Integration Notice */}
      <div className="rounded-2xl bg-[#151515] border border-[#303030] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#FFFFFF] shrink-0 mt-0.5" />
          <p className="text-xs text-[#B8B8B8] leading-relaxed">
            <strong className="text-[#FFFFFF] font-medium">Illustrative Offers Disclosure:</strong> Displayed merchant perks are simulated examples for reward calculation and not active bank partnerships. Live merchant offers and map geolocation require an authorized partner API.
          </p>
        </div>
        {nearbyEnabled && (
          <span className="font-mono-tabular text-xs text-[#FFFFFF] shrink-0">
            Location Grid: Central Metro District
          </span>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search
            className="w-4 h-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search offers by merchant or reward"
            placeholder="Search merchants or discounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-[#151515] border border-[#303030] pl-10 pr-4 py-2 text-sm text-[#FFFFFF] placeholder-[#858585] focus:outline-none focus:border-[#FFFFFF]"
          />
        </div>

        <div
          role="group"
          aria-label="Filter offers by category"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0"
        >
          {(['All', ...PURCHASE_CATEGORIES] as (PurchaseCategory | 'All')[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#FFFFFF] text-[#080808] font-semibold'
                  : 'bg-[#151515] text-[#B8B8B8] hover:bg-[#252525] hover:text-[#FFFFFF] border border-[#303030]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOffers.map((offer) => (
          <article
            key={offer.id}
            className="rounded-2xl bg-[#151515] border border-[#303030] p-6 flex flex-col justify-between hover:border-[#858585] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-[#858585] mb-2">
                <span>{offer.category} · Card Offer</span>
                <span className="inline-flex items-center gap-1 font-mono-tabular text-[#B8B8B8]">
                  <MapPin className="w-3.5 h-3.5 text-[#FFFFFF]" />
                  {offer.distanceLabel}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#FFFFFF]">{offer.merchant}</h2>

              <div className="font-mono-tabular text-base font-bold text-[#FFFFFF] mt-2">
                {offer.discountLabel}
              </div>

              <p className="text-xs text-[#B8B8B8] mt-2 leading-relaxed">
                {offer.sampleTerms}
              </p>
            </div>

            <div className="pt-4 mt-5 border-t border-[#303030] flex items-center justify-between gap-2">
              <span className="text-xs text-[#858585]">
                Pair with <strong className="text-[#FFFFFF]">{offer.recommendedCard}</strong>
              </span>

              <button
                type="button"
                onClick={() => onSimulateOffer(offer)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#303030] hover:bg-[#252525] hover:border-[#FFFFFF] text-xs font-medium text-[#FFFFFF] transition-colors whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <span>Test in Smart Pick</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <div className="rounded-2xl bg-[#151515] border border-[#303030] p-12 text-center space-y-3">
          <p className="text-base font-semibold text-[#FFFFFF]">
            No offers match your filter
          </p>
          <p className="text-xs text-[#B8B8B8]">
            Try clearing your search query or switching the category filter to All.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-xs font-semibold text-[#080808] hover:bg-[#E5E5E5] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
