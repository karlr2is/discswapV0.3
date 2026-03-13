import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ListingCard } from '../components/listings/ListingCard';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';

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

type HomePageProps = {
  onNavigateToListing: (id: string) => void;
  onNavigateToFilters: () => void;
  searchQuery?: string;
};

const PAGE_SIZE = 12;

export function HomePage({ onNavigateToListing, searchQuery = '' }: HomePageProps) {
  const { language } = useSettings();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initial load
  useEffect(() => {
    setListings([]);
    setPage(0);
    setHasMore(true);
    fetchListings(0, true);
  }, []);

  const fetchListings = useCallback(async (pageNum: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setListings(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }

    if (reset) setLoading(false);
    else setLoadingMore(false);
  }, []);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchListings(nextPage);
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchListings]);

  const filteredListings = listings.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden animate-pulse"
              style={{ backgroundColor: 'var(--ds-card)' }}
            >
              <div className="bg-slate-700/40" style={{ aspectRatio: '4/3' }} />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-slate-600/40 rounded w-3/4" />
                <div className="h-3 bg-slate-600/40 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">{t('noListingsFound', language)}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => onNavigateToListing(listing.id)}
              />
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-8 mt-4 flex items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Loading more...
              </div>
            )}
            {!hasMore && listings.length > 0 && (
              <p className="text-xs text-slate-500">All listings loaded</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
