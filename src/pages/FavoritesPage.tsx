import { useEffect, useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { t } from '../utils/translations';
import { ListingCard } from '../components/listings/ListingCard';

type FavoritesPageProps = {
  onBack: () => void;
  onNavigateToListing: (id: string) => void;
};

type Listing = {
  id: string;
  title: string;
  price: number | null;
  condition_score: number | null;
  location: string | null;
  images: string[];
  listing_type: 'for_sale' | 'wanted';
};

export function FavoritesPage({ onBack, onNavigateToListing }: FavoritesPageProps) {
  const { language } = useSettings();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    setLoading(true);
    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', user.id);

    if (favoritesData && favoritesData.length > 0) {
      const listingIds = favoritesData.map((f) => f.listing_id);
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .in('id', listingIds)
        .eq('status', 'active');

      if (listingsData) {
        setFavorites(listingsData);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold dark:text-white">{t('favorites', language)}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('loading', language)}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('noFavorites', language)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('saveFavorites', language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => onNavigateToListing(listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
