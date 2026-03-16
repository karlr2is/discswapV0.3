import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';
import { ListingCard } from '../components/listings/ListingCard';

type MyListingsPageProps = {
  onBack: () => void;
  onNavigateToListing: (id: string) => void;
  onNavigateToEdit: (id: string) => void;
};

type Listing = {
  id: string;
  title: string;
  price: number | null;
  condition_score: number | null;
  location: string | null;
  images: string[];
  listing_type: 'for_sale' | 'wanted';
  status: 'active' | 'sold' | 'deleted';
  created_at: string;
};

export function MyListingsPage({ onBack, onNavigateToListing, onNavigateToEdit }: MyListingsPageProps) {
  const { user } = useAuth();
  const { language } = useSettings();
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchListings();
  }, [user, activeTab]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', activeTab)
      .order('created_at', { ascending: false });
    if (data) setListings(data);
    setLoading(false);
  };

  const handleMarkAsSold = async (listingId: string) => {
    const { error } = await supabase
      .from('listings').update({ status: 'sold' }).eq('id', listingId);
    if (!error) fetchListings();
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm(t('deleteListingConfirm', language))) return;
    const { error } = await supabase
      .from('listings').update({ status: 'deleted' }).eq('id', listingId);
    if (!error) fetchListings();
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--ds-bg)' }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 shadow-sm"
        style={{ backgroundColor: 'var(--ds-card)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">{t('myListings', language)}</h1>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {(['active', 'sold'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="pb-3 px-2 text-sm font-medium transition-colors relative"
                style={{ color: activeTab === tab ? 'var(--ds-accent)' : '#64748b' }}
              >
                {tab === 'active' ? t('activeListings', language) : t('soldListings', language)}
                {activeTab === tab && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--ds-accent)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">{t('loading', language)}</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {activeTab === 'active' ? t('noActiveListings', language) : t('noSoldListings', language)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {listings.map(listing => (
              <div key={listing.id} className="flex flex-col gap-2">
                <ListingCard
                  listing={listing}
                  onClick={() => onNavigateToListing(listing.id)}
                />
                {activeTab === 'active' && (
                  <div className="flex gap-1.5">
                    {/* Edit */}
                    <button
                      onClick={e => { e.stopPropagation(); onNavigateToEdit(listing.id); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ backgroundColor: 'rgba(47,111,237,0.15)', color: 'var(--ds-accent)', border: '1px solid rgba(47,111,237,0.25)' }}
                    >
                      <Edit2 className="w-3 h-3" />
                      {t('editListing', language)}
                    </button>
                    {/* Mark sold */}
                    <button
                      onClick={e => { e.stopPropagation(); handleMarkAsSold(listing.id); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ backgroundColor: 'rgba(22,163,74,0.15)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.25)' }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {t('soldListings', language)}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(listing.id); }}
                      className="flex items-center justify-center p-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
