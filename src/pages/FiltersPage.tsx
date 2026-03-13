import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../utils/translations';
import { ArrowLeft } from 'lucide-react';

type FiltersPageProps = {
  onApplyFilters: (filters: FilterOptions) => void;
  onBack: () => void;
};

export type FilterOptions = {
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  minCondition: string;
  minSpeed: string;
  maxSpeed: string;
  location: string;
  listingType: string;
};

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

type ParentCategory = Category & {
  subcategories: Category[];
};

export function FiltersPage({ onApplyFilters, onBack }: FiltersPageProps) {
  const { language } = useSettings();
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    minCondition: '',
    minSpeed: '',
    maxSpeed: '',
    location: '',
    listingType: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .order('name');

    if (allCategories) {
      const parents = allCategories.filter(cat => cat.parent_id === null);
      const parentWithSubs: ParentCategory[] = parents.map(parent => ({
        ...parent,
        subcategories: allCategories.filter(cat => cat.parent_id === parent.id)
      }));
      setParentCategories(parentWithSubs);
    }
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onBack();
  };

  const handleClear = () => {
    setFilters({
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      minCondition: '',
      minSpeed: '',
      maxSpeed: '',
      location: '',
      listingType: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 dark:text-white" />
          </button>
          <h1 className="text-lg font-semibold dark:text-white">{t('filters', language)}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('listingType', language)}
            </label>
            <select
              id="listingType"
              value={filters.listingType}
              onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('all', language)}</option>
              <option value="for_sale">{t('forSale', language)}</option>
              <option value="wanted">{t('wanted', language)}</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('category', language)}
            </label>
            <select
              id="category"
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('allCategories', language)}</option>
              {parentCategories.map((parent) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{t('all', language)} {parent.name}</option>
                  {parent.subcategories.map((subcat) => (
                    <option key={subcat.id} value={subcat.id}>
                      {subcat.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('priceRange', language)}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder={t('min', language)}
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder={t('max', language)}
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="minCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('minimumCondition', language)}
            </label>
            <select
              id="minCondition"
              value={filters.minCondition}
              onChange={(e) => setFilters({ ...filters, minCondition: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('anyCondition', language)}</option>
              <option value="9">{t('condition9', language)}</option>
              <option value="8">{t('condition8', language)}</option>
              <option value="7">{t('condition7', language)}</option>
              <option value="6">{t('condition6', language)}</option>
              <option value="5">{t('condition5', language)}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('discSpeedRange', language)}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder={t('minSpeed', language)}
                min="1"
                max="14"
                value={filters.minSpeed}
                onChange={(e) => setFilters({ ...filters, minSpeed: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder={t('maxSpeed', language)}
                min="1"
                max="14"
                value={filters.maxSpeed}
                onChange={(e) => setFilters({ ...filters, maxSpeed: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('location', language)}
            </label>
            <input
              id="location"
              type="text"
              placeholder={t('enterLocation', language)}
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
        <button
          onClick={handleClear}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {t('clearAll', language)}
        </button>
        <button
          onClick={handleApply}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {t('applyFilters', language)}
        </button>
      </div>
    </div>
  );
}
