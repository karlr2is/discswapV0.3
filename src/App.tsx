import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthModal } from './components/auth/AuthModal';
import { Layout } from './components/layout/Layout';
import { FiltersPanel, FilterOptions } from './components/listings/FiltersPanel';
import { LandingPage } from './pages/LandingPage';
import { AllListingsPage } from './pages/AllListingsPage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryListingsPage } from './pages/CategoryListingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { supabase } from './lib/supabase';
import { ListingCard } from './components/listings/ListingCard';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { t } from './utils/translations';

type Page =
  | { type: 'landing' }            // new structured landing page
  | { type: 'home'; searchQuery?: string }               // full listings feed (AllListingsPage)
  | { type: 'wanted-listings' }    // wanted/otsin listings
  | { type: 'listing'; id: string }
  | { type: 'create' }
  | { type: 'listing-edit'; id: string }
  | { type: 'categories' }
  | { type: 'category-listings'; categoryId: string; categoryName: string }
  | { type: 'profile'; userId?: string }
  | { type: 'edit-profile' }
  | { type: 'messages'; conversationId?: string; sellerId?: string; listingId?: string }
  | { type: 'filtered-results' }
  | { type: 'settings' }
  | { type: 'favorites' }
  | { type: 'my-listings' };

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

const FEED_TYPES = new Set(['home', 'filtered-results', 'wanted-listings']);

function MainApp() {
  const { user, loading } = useAuth();
  const { language } = useSettings();
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'landing' });
  const [pageHistory, setPageHistory] = useState<Page[]>([{ type: 'landing' }]);
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // ── Scroll restoration ──────────────────────────────────────────
  const savedFeedScroll = useRef(0);
  const pendingRestore  = useRef(false);

  const isFeedPage = (p: Page) => FEED_TYPES.has(p.type);

  /** Call this whenever currentPage changes to 'home' or 'filtered-results' via goBack */
  useEffect(() => {
    if (pendingRestore.current && isFeedPage(currentPage)) {
      pendingRestore.current = false;
      const target = savedFeedScroll.current;
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior })
        )
      );
    }
  }, [currentPage]);
  // ────────────────────────────────────────────────────────────────

  const navigate = (page: Page) => {
    // Synchronously grab scroll before React state update changes anything
    if (isFeedPage(currentPage)) {
      savedFeedScroll.current = window.scrollY;
    }
    setPageHistory(prev => [...prev, page]);
    setCurrentPage(page);
    window.scrollTo(0, 0);

    // Push state to browser history
    window.history.pushState({ page }, '', window.location.pathname);
  };

  const goBack = () => {
    window.history.back();
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.page) {
        const target = event.state.page as Page;
        if (isFeedPage(target)) {
          pendingRestore.current = true;
        }
        setPageHistory(prev => prev.slice(0, -1));
        setCurrentPage(target);
      } else {
        // If no state, go to landing
        setPageHistory([{ type: 'landing' }]);
        setCurrentPage({ type: 'landing' });
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial state
    window.history.replaceState({ page: currentPage }, '', window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleNavigateBasicWithReset = (pageType: string) => {
    if (pageType !== 'home') setSearchQuery('');
    handleNavigateBasic(pageType);
  };

  useEffect(() => {
    if (filters) applyFilters();
  }, [filters]);

  const applyFilters = async () => {
    if (!filters) return;

    let query = supabase.from('listings').select('*').eq('status', 'active');
    if (filters.categoryId)   query = query.eq('category_id', filters.categoryId);
    if (filters.listingType)  query = query.eq('listing_type', filters.listingType);
    if (filters.minPrice)     query = query.gte('price', parseFloat(filters.minPrice));
    if (filters.maxPrice)     query = query.lte('price', parseFloat(filters.maxPrice));
    if (filters.minCondition) query = query.gte('condition_score', parseInt(filters.minCondition));
    if (filters.minSpeed)     query = query.gte('disc_speed', parseInt(filters.minSpeed));
    if (filters.maxSpeed)     query = query.lte('disc_speed', parseInt(filters.maxSpeed));
    if (filters.location)     query = query.ilike('location', `%${filters.location}%`);

    const { data } = await query.order('created_at', { ascending: false });
    if (data) {
      setFilteredListings(data);
      setCurrentPage({ type: 'filtered-results' });
    }
  };

  const handleNavigateBasic = (pageType: string) => {
    if (pageType === 'home') {
      // 'home' nav button goes to the landing page and resets history
      setFilters(null);
      setPageHistory([{ type: 'landing' }]);
      setCurrentPage({ type: 'landing' });
      window.scrollTo(0, 0);
      window.history.pushState({ page: { type: 'landing' } }, '', window.location.pathname);
    } else if (pageType === 'listings') {
      navigate({ type: 'home' });
    } else if (pageType === 'categories') {
      navigate({ type: 'categories' });
    } else if (pageType === 'create') {
      if (!user) { setShowAuthModal(true); return; }
      navigate({ type: 'create' });
    } else if (pageType === 'messages') {
      if (!user) { setShowAuthModal(true); return; }
      navigate({ type: 'messages' });
    } else if (pageType === 'profile') {
      if (!user) { setShowAuthModal(true); return; }
      navigate({ type: 'profile' });
    } else if (pageType === 'settings') {
      if (!user) { setShowAuthModal(true); return; }
      navigate({ type: 'settings' });
    } else if (pageType === 'favorites') {
      if (!user) { setShowAuthModal(true); return; }
      navigate({ type: 'favorites' });
    } else if (pageType === 'my-listings') {
      if (!user) { setShowAuthModal(true); return; }
      navigate({ type: 'my-listings' });
    } else if (pageType === 'search') {
      setShowFiltersPanel(true);
    } else if (pageType === 'wanted-listings') {
      navigate({ type: 'wanted-listings' });
    } else if (pageType.startsWith('category-')) {
      const categoryId = pageType.replace('category-', '');
      navigate({ type: 'category-listings', categoryId, categoryName: '' });
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      navigate({ type: 'home', searchQuery: query });
    }
  };

  const handleContactSeller = (sellerId: string, listingId: string) => {
    if (!user) { setShowAuthModal(true); return; }
    navigate({ type: 'messages', sellerId, listingId });
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--ds-bg)' }}>
        <div className="text-gray-500">{t('loading', language)}</div>
      </div>
    );
  }

  const getPageType = (page: Page): string => {
    switch (page.type) {
      case 'landing': return 'home';          // nav highlights Home on landing
      case 'home':
      case 'wanted-listings':
      case 'filtered-results': return 'home';
      case 'categories':
      case 'category-listings': return 'categories';
      case 'create': return 'create';
      case 'messages': return 'messages';
      case 'profile':
      case 'edit-profile': return 'profile';
      case 'settings': return 'settings';
      case 'favorites': return 'favorites';
      default: return 'home';
    }
  };

  const feedActive = currentPage.type === 'home';
  const isLanding  = currentPage.type === 'landing';
  const currentSearchQuery = currentPage.type === 'home' && currentPage.searchQuery ? currentPage.searchQuery : searchQuery;

  return (
    <>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showFiltersPanel && (
        <FiltersPanel
          onApplyFilters={handleApplyFilters}
          onClose={() => setShowFiltersPanel(false)}
        />
      )}

      <Layout
        currentPage={getPageType(currentPage)}
        onNavigate={handleNavigateBasicWithReset}
        onShowAuth={() => setShowAuthModal(true)}
        searchQuery={currentSearchQuery}
        onSearchChange={setSearchQuery}
        onNavigateToFilters={() => setShowFiltersPanel(true)}
        onSearchSubmit={handleSearchSubmit}
        showSearch={feedActive || isLanding}
      >
        {/* ── Landing page ── */}
        {isLanding && (
          <LandingPage
            onNavigateToListing={(id) => navigate({ type: 'listing', id })}
            onNavigateToAllListings={() => navigate({ type: 'home' })}
            onNavigateToCategoryListings={(categoryId, categoryName) =>
              navigate({ type: 'category-listings', categoryId, categoryName })
            }
            searchQuery={currentSearchQuery}
            onSearchChange={setSearchQuery}
            onNavigateToFilters={() => setShowFiltersPanel(true)}
          />
        )}

        {/* ── Feed (always mounted so scroll + listings are preserved) ── */}
        <div
          id="home-feed"
          aria-hidden={!feedActive}
          style={feedActive ? {} : {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            visibility: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <AllListingsPage
            onNavigateToListing={(id) => navigate({ type: 'listing', id })}
            onNavigateToFilters={() => setShowFiltersPanel(true)}
            searchQuery={currentSearchQuery}
          />
        </div>

        {/* ── Other pages (conditionally rendered) ── */}

        {currentPage.type === 'wanted-listings' && (
          <div className="max-w-7xl mx-auto">
            <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3" style={{ backgroundColor: 'var(--ds-bg)' }}>
              <button onClick={goBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-lg font-semibold text-white">{t('otsin', language)}</h1>
            </div>
            <AllListingsPage
              onNavigateToListing={(id) => navigate({ type: 'listing', id })}
              onNavigateToFilters={() => setShowFiltersPanel(true)}
              searchQuery={searchQuery}
              filterListingType="wanted"
            />
          </div>
        )}

        {currentPage.type === 'filtered-results' && !feedActive && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('filteredResults', language)} ({filteredListings.length})
              </h1>
              <button
                onClick={() => setShowFiltersPanel(true)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">{t('filters', language)}</span>
              </button>
            </div>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchInResults', language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">{t('noListingsWithFilters', language)}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredListings
                  .filter((l: Listing) => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((listing: Listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onClick={() => navigate({ type: 'listing', id: listing.id })}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {currentPage.type === 'listing' && (
          <ListingDetailPage
            listingId={currentPage.id}
            onBack={goBack}
            onContactSeller={handleContactSeller}
            onViewProfile={(userId) => navigate({ type: 'profile', userId })}
          />
        )}

        {currentPage.type === 'create' && user && (
          <CreateListingPage onBack={goBack} onSuccess={() => navigate({ type: 'home' })} />
        )}

        {currentPage.type === 'listing-edit' && user && (
          <CreateListingPage
            onBack={goBack}
            onSuccess={() => navigate({ type: 'my-listings' })}
            editListingId={currentPage.id}
          />
        )}

        {currentPage.type === 'categories' && (
          <CategoriesPage
            onSelectCategory={(categoryId, categoryName) =>
              navigate({ type: 'category-listings', categoryId, categoryName })
            }
            onClose={goBack}
          />
        )}

        {currentPage.type === 'category-listings' && (
          <CategoryListingsPage
            categoryId={currentPage.categoryId}
            categoryName={currentPage.categoryName}
            onBack={goBack}
            onNavigateToListing={(id) => navigate({ type: 'listing', id })}
          />
        )}

        {currentPage.type === 'profile' && (
          <ProfilePage
            userId={currentPage.userId}
            onNavigateToListing={(id) => navigate({ type: 'listing', id })}
            onEditProfile={() => navigate({ type: 'edit-profile' })}
            onBack={goBack}
            onNavigateToMyListings={() => navigate({ type: 'my-listings' })}
          />
        )}

        {currentPage.type === 'edit-profile' && user && (
          <EditProfilePage onBack={goBack} onSuccess={() => navigate({ type: 'profile' })} />
        )}

        {currentPage.type === 'messages' && user && (
          <MessagesPage
            initialConversationId={currentPage.conversationId}
            initialSellerId={currentPage.sellerId}
            initialListingId={currentPage.listingId}
            onBack={goBack}
          />
        )}

        {currentPage.type === 'settings' && user && (
          <SettingsPage onBack={goBack} />
        )}

        {currentPage.type === 'favorites' && user && (
          <FavoritesPage
            onBack={goBack}
            onNavigateToListing={(id) => navigate({ type: 'listing', id })}
          />
        )}

        {currentPage.type === 'my-listings' && user && (
          <MyListingsPage
            onBack={goBack}
            onNavigateToListing={(id) => navigate({ type: 'listing', id })}
            onNavigateToEdit={(id) => navigate({ type: 'listing-edit', id })}
          />
        )}
      </Layout>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainApp />
      </SettingsProvider>
    </AuthProvider>
  );
}
