import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, DollarSign, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    price: number | null;
    condition_score: number | null;
    location: string | null;
    images: string[];
    listing_type: 'for_sale' | 'wanted';
  };
  onClick: () => void;
};

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/7045818/pexels-photo-7045818.jpeg?auto=compress&cs=tinysrgb&w=400';

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Image swipe state
  const images = listing.images && listing.images.length > 0 ? listing.images : [FALLBACK_IMAGE];
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (user) checkFavoriteStatus();
    fetchFavoriteCount();
  }, [user, listing.id]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle();
    setIsFavorited(!!data);
  };

  const fetchFavoriteCount = async () => {
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id);
    setFavoriteCount(count || 0);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (isFavorited) {
      await supabase.from('favorites').delete()
        .eq('user_id', user.id).eq('listing_id', listing.id);
      setIsFavorited(false);
      setFavoriteCount(p => Math.max(0, p - 1));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, listing_id: listing.id });
      setIsFavorited(true);
      setFavoriteCount(p => p + 1);
    }
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return; // threshold
    if (dx < 0) setImgIndex(i => Math.min(i + 1, images.length - 1));
    else         setImgIndex(i => Math.max(i - 1, 0));
  };

  const getConditionColor = (score: number | null) => {
    if (!score) return 'bg-slate-700 text-slate-300';
    if (score >= 9) return 'bg-emerald-900/80 text-emerald-300';
    if (score >= 7) return 'bg-blue-900/80 text-blue-300';
    if (score >= 5) return 'bg-amber-900/80 text-amber-300';
    return 'bg-orange-900/80 text-orange-300';
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="text-left w-full rounded-xl overflow-hidden shadow-md flex flex-col"
      style={{
        backgroundColor: 'var(--ds-card)',
        border: '1px solid rgba(255,255,255,0.06)',
        /* Enforce consistent height so cards in a row align */
        minHeight: '0',
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ aspectRatio: '4/3' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={imgIndex}
            src={images[imgIndex]}
            alt={listing.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18 }}
            className="w-full h-full object-cover absolute inset-0"
            draggable={false}
          />
        </AnimatePresence>

        {/* Badges */}
        {listing.listing_type === 'wanted' && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10">
            WANTED
          </div>
        )}
        {listing.condition_score && (
          <div className={`absolute top-2 right-2 ${getConditionColor(listing.condition_score)} text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm z-10`}>
            {listing.condition_score}/10
          </div>
        )}

        {/* Favorite button */}
        {user && (
          <button
            onClick={handleToggleFavorite}
            className="absolute bottom-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all z-10"
            style={{ background: 'rgba(10,20,30,0.65)' }}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        )}

        {/* Dot indicators for multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === imgIndex ? 14 : 6,
                  height: 5,
                  backgroundColor: i === imgIndex ? 'white' : 'rgba(255,255,255,0.45)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card content — flex-1 so all cards stretch to same height */}
      <div className="p-2.5 flex flex-col flex-1 gap-0.5">
        <h3 className="font-semibold text-slate-100 text-sm leading-snug truncate">
          {listing.title}
        </h3>

        {listing.price !== null && (
          <div className="flex items-center gap-0.5 font-bold text-slate-100 text-base">
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            {listing.price.toFixed(2)}
          </div>
        )}

        {listing.location && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-auto">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Heart className="w-3 h-3" />
          {favoriteCount}
        </div>
      </div>
    </motion.button>
  );
}
