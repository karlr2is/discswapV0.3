import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';
import { MapPin, Calendar, Star, CreditCard as Edit2, Package, ArrowLeft, Bookmark, Trash2 } from 'lucide-react';
import { ListingCard } from '../components/listings/ListingCard';

type ProfilePageProps = {
  userId?: string;
  onNavigateToListing: (id: string) => void;
  onEditProfile?: () => void;
  onBack?: () => void;
};

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  created_at: string;
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

export function ProfilePage({ userId, onNavigateToListing, onEditProfile, onBack }: ProfilePageProps) {
  const { user, profile: currentUserProfile } = useAuth();
  const { language } = useSettings();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedSearches, setSavedSearches] = useState<Array<{ id: string; name: string; filters: Record<string, string>; created_at: string }>>([]);

  const viewingUserId = userId || user?.id;
  const isOwnProfile = user?.id === viewingUserId;

  useEffect(() => {
    if (viewingUserId) {
      fetchProfile();
      fetchListings();
      fetchRatings();
      if (isOwnProfile) fetchSavedSearches();
    }
  }, [viewingUserId]);

  const fetchSavedSearches = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setSavedSearches(data);
  };

  const handleDeleteSavedSearch = async (id: string) => {
    await supabase.from('saved_searches').delete().eq('id', id);
    setSavedSearches(prev => prev.filter(s => s.id !== id));
  };

  const fetchProfile = async () => {
    if (!viewingUserId) return;

    if (isOwnProfile && currentUserProfile) {
      setProfile(currentUserProfile as Profile);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', viewingUserId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchListings = async () => {
    if (!viewingUserId) return;

    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', viewingUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setListings(data);
    }
  };

  const fetchRatings = async () => {
    if (!viewingUserId) return;

    const { data } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_user_id', viewingUserId);

    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setRating(avg);
      setRatingCount(data.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">{t('loading', language)}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">{t('profileNotFound', language)}</div>
      </div>
    );
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {onBack && !isOwnProfile && (
        <div className="mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{profile.username}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                  <span>({ratingCount} {t('reviews', language)})</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{t('joined', language)} {joinDate}</span>
              </div>
            </div>
            {profile.location && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
              </div>
            )}
          </div>
          {isOwnProfile && onEditProfile && (
            <button
              onClick={onEditProfile}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4 dark:text-white" />
              <span className="dark:text-white">{t('edit', language)}</span>
            </button>
          )}
        </div>

        {profile.bio && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('listings', language)} ({listings.length})
        </h2>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">{t('noListings', language)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => onNavigateToListing(listing.id)}
            />
          ))}
        </div>
      )}

      {/* Saved searches — own profile only */}
      {isOwnProfile && savedSearches.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Searches</h2>
          </div>
          <div className="space-y-2">
            {savedSearches.map(search => (
              <div
                key={search.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{search.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {Object.entries(search.filters)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteSavedSearch(search.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
