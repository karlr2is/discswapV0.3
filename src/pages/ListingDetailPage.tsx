import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';
import { MapPin, DollarSign, ArrowLeft, MessageCircle, Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

type ListingDetailPageProps = {
  listingId: string;
  onBack: () => void;
  onContactSeller: (sellerId: string, listingId: string) => void;
  onViewProfile: (userId: string) => void;
};

type ListingDetail = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  condition: string | null;
  condition_score: number | null;
  location: string | null;
  images: string[];
  listing_type: 'for_sale' | 'wanted';
  disc_speed: number | null;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    location: string | null;
    created_at: string;
  };
};

export function ListingDetailPage({ listingId, onBack, onContactSeller, onViewProfile }: ListingDetailPageProps) {
  const { user } = useAuth();
  const { language } = useSettings();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sellerRating, setSellerRating] = useState<number | null>(null);
  const [listingCount, setListingCount] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles (username, avatar_url, location, created_at)
      `)
      .eq('id', listingId)
      .maybeSingle();

    if (!error && data) {
      setListing(data as any);
      fetchSellerStats(data.user_id);
    }
    setLoading(false);
  };

  const fetchSellerStats = async (userId: string) => {
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('rated_user_id', userId);

    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      setSellerRating(avg);
    }

    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    setListingCount(count || 0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const getImages = () => {
    return listing?.images && listing.images.length > 0
      ? listing.images
      : ['https://images.pexels.com/photos/7045818/pexels-photo-7045818.jpeg?auto=compress&cs=tinysrgb&w=800'];
  };

  const handleTouchEnd = () => {
    const images = getImages();
    if (touchStartX.current - touchEndX.current > 50) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
    if (touchStartX.current - touchEndX.current < -50) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const nextImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">{t('loading', language)}</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">{t('listingNotFound', language)}</div>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.pexels.com/photos/7045818/pexels-photo-7045818.jpeg?auto=compress&cs=tinysrgb&w=800'];

  const isOwnListing = user?.id === listing.user_id;
  const joinDate = new Date(listing.profiles.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold dark:text-white">{t('listingDetails', language)}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="relative">
            <div
              className="aspect-square md:aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            {listing.listing_type === 'wanted' && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg">
                {t('wantedBadge', language)}
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{listing.title}</h2>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {listing.price !== null && (
                <div className="flex items-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
                  <DollarSign className="w-6 h-6" />
                  {listing.price.toFixed(2)}
                </div>
              )}
              {listing.condition_score && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                  {t('conditionScore', language)}: {listing.condition_score}/10
                </span>
              )}
              {listing.condition && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                  {listing.condition}
                </span>
              )}
            </div>

            {listing.location && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="w-5 h-5" />
                <span>{listing.location}</span>
              </div>
            )}

            {listing.disc_speed && (
              <div className="mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('speed', language)}: </span>
                <span className="font-medium dark:text-white">{listing.disc_speed}</span>
              </div>
            )}

            {listing.description && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('description', language)}</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-20 md:mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('sellerInformation', language)}</h3>

          <button
            onClick={() => onViewProfile(listing.user_id)}
            className="flex items-center gap-4 w-full hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {listing.profiles.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900 dark:text-white">{listing.profiles.username}</div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                {sellerRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{sellerRating.toFixed(1)}</span>
                  </div>
                )}
                <span>{listingCount} {t('listingCount', language)}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{t('joined', language)} {joinDate}</span>
                </div>
              </div>
              {listing.profiles.location && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.profiles.location}</span>
                </div>
              )}
            </div>
          </button>

          {!isOwnListing && user && (
            <button
              onClick={() => onContactSeller(listing.user_id, listing.id)}
              className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {t('contactSeller', language)}
            </button>
          )}
          {!isOwnListing && !user && (
            <button
              onClick={() => onContactSeller(listing.user_id, listing.id)}
              className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {t('signInToContact', language)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
