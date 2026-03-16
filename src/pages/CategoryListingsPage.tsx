import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';
import { t, translateCategoryName } from '../utils/translations';
import { ListingCard } from '../components/listings/ListingCard';
import { ArrowLeft } from 'lucide-react';

type CategoryListingsPageProps = {
  categoryId: string;
  categoryName: string;
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

export function CategoryListingsPage({ categoryId, categoryName, onBack, onNavigateToListing }: CategoryListingsPageProps) {
  const { language } = useSettings();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [subcategoryIds, setSubcategoryIds] = useState<string[]>([]);

  useEffect(() => {
    checkCategoryType();
  }, [categoryId]);

  const checkCategoryType = async () => {
    const { data: subcategories } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId);

    if (subcategories && subcategories.length > 0) {
      setSubcategoryIds(subcategories.map(cat => cat.id));
      fetchListingsForParentCategory(subcategories.map(cat => cat.id));
    } else {
      setSubcategoryIds([]);
      fetchListings();
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setListings(data);
    }
    setLoading(false);
  };

  const fetchListingsForParentCategory = async (subCategoryIds: string[]) => {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*')
      .in('category_id', subCategoryIds)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setListings(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold dark:text-white">{translateCategoryName(categoryName, language)}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{t('noListingsInCategory', language)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
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
