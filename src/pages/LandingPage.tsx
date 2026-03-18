import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ListingCard } from '../components/listings/ListingCard';
import { useSettings } from '../contexts/SettingsContext';
import { t, translateCategoryName } from '../utils/translations';
import { LayoutList } from 'lucide-react';

type Listing = {
  id: string;
  title: string;
  price: number | null;
  condition_score: number | null;
  location: string | null;
  images: string[];
  listing_type: 'for_sale' | 'wanted';
  category_id: string | null;
  disc_speed: number | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type LandingPageProps = {
  onNavigateToListing: (id: string) => void;
  onNavigateToAllListings: () => void;
  onNavigateToCategoryListings: (categoryId: string, categoryName: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNavigateToFilters?: () => void;
};

const GRID_LIMIT = 4;

/** Fetch up to 4 active FOR_SALE listings for a given set of category IDs */
async function fetchGridListings(categoryIds: string[]): Promise<Listing[]> {
  if (categoryIds.length === 0) return [];
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('listing_type', 'for_sale')
    .in('category_id', categoryIds)
    .order('created_at', { ascending: false })
    .limit(GRID_LIMIT);
  return data ?? [];
}

export function LandingPage({
  onNavigateToListing,
  onNavigateToAllListings,
  onNavigateToCategoryListings,
  searchQuery = '',
  onSearchChange,
  onNavigateToFilters,
}: LandingPageProps) {
  const { language } = useSettings();
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [discListings, setDiscListings] = useState<Listing[]>([]);
  const [bagListings, setBagListings] = useState<Listing[]>([]);
  const [gearListings, setGearListings] = useState<Listing[]>([]);
  const [wantedListings, setWantedListings] = useState<Listing[]>([]);

  // Category parent records keyed by slug
  const [parentMap, setParentMap] = useState<Record<string, Category>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    // 1. Fetch all categories
    const { data: cats } = await supabase.from('categories').select('*');
    if (!cats) return;

    const parents: Record<string, Category> = {};
    const subs: Record<string, Category[]> = {};

    cats.forEach(c => {
      if (c.parent_id === null) {
        parents[c.slug] = c;
        subs[c.slug] = [];
      }
    });
    cats.forEach(c => {
      if (c.parent_id !== null) {
        const parentSlug = Object.values(parents).find(p => p.id === c.parent_id)?.slug;
        if (parentSlug) subs[parentSlug].push(c);
      }
    });

    setParentMap(parents);

    // 2. Recently added — newest 4 FOR_SALE across all
    const { data: recent } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .eq('listing_type', 'for_sale')
      .order('created_at', { ascending: false })
      .limit(GRID_LIMIT);
    setRecentListings(recent ?? []);

    // 3. Category grids (for_sale only)
    const discIds   = (subs['discs']     ?? []).map(c => c.id);
    const bagIds    = (subs['bags-carts'] ?? []).map(c => c.id);
    const gearIds   = (subs['other-gear'] ?? []).map(c => c.id);

    const [disc, bag, gear] = await Promise.all([
      fetchGridListings(discIds),
      fetchGridListings(bagIds),
      fetchGridListings(gearIds),
    ]);

    setDiscListings(disc);
    setBagListings(bag);
    setGearListings(gear);

    // 4. Wanted listings (Otsin)
    const { data: wanted } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .eq('listing_type', 'wanted')
      .order('created_at', { ascending: false })
      .limit(GRID_LIMIT);
    setWantedListings(wanted ?? []);
  };

  const CardSkeleton = () => (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ backgroundColor: 'var(--ds-card)' }}
    >
      <div className="bg-slate-700/40" style={{ aspectRatio: '4/3' }} />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-slate-600/40 rounded w-3/4" />
        <div className="h-3 bg-slate-600/40 rounded w-1/2" />
      </div>
    </div>
  );

  /** Render a responsive grid section: 2×2 mobile, 4-col single row desktop */
  const renderSection = (
    listings: Listing[],
    titleKey: string,
    parentSlug?: string,
    seeAllAction?: () => void,
  ) => {
    const parent = parentSlug ? parentMap[parentSlug] : undefined;
    const displayTitle = parent
      ? translateCategoryName(parent.name, language)
      : t(titleKey, language);

    const onSeeAll = seeAllAction
      ? seeAllAction
      : parent
        ? () => onNavigateToCategoryListings(parent.id, parent.name)
        : undefined;

    return (
      <section className="mb-8 px-4 sm:px-6 lg:px-8">
        {/* Center-aligned title */}
        <h2 className="text-lg font-bold text-slate-100 text-center mb-4">
          {displayTitle}
        </h2>

        {/* Responsive grid: 2-col mobile, 4-col desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {listings.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            : listings.slice(0, 4).map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => onNavigateToListing(listing.id)}
                />
              ))}
        </div>

        {/* Center-aligned "See All" button */}
        {onSeeAll && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onSeeAll}
              className="text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--ds-accent)', border: '1px solid rgba(47,111,237,0.3)' }}
            >
              {t('seeAll', language)}
            </button>
          </div>
        )}
      </section>
    );
  };

  return (
    <div>
      {/* ── Centered "All Listings" button ─────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-6">
        <div className="flex justify-center">
          <button
            onClick={onNavigateToAllListings}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-slate-200 border border-slate-600 hover:border-slate-400 hover:text-white transition-all text-sm"
            style={{ backgroundColor: 'var(--ds-card)' }}
          >
            <LayoutList className="w-4 h-4" />
            {t('allListings', language)}
          </button>
        </div>
      </div>

      {/* ── Recently Added ─────────────────────────────── */}
      {renderSection(recentListings, 'recentlyAdded')}

      {/* ── Category sections ──────────────────────────── */}
      {renderSection(discListings, 'discs', 'discs')}
      {renderSection(bagListings, 'bags-carts', 'bags-carts')}
      {renderSection(gearListings, 'other-gear', 'other-gear')}

      {/* ── Otsin (Wanted) section ─────────────────────── */}
      {renderSection(wantedListings, 'otsin', undefined, onNavigateToAllListings)}
    </div>
  );
}
