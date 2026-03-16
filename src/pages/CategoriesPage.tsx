import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronDown, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { t, translateCategoryName } from '../utils/translations';

type CategoriesPageProps = {
  onSelectCategory: (categoryId: string, categoryName: string) => void;
  onClose: () => void;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type ParentCategory = Category & {
  subcategories: Category[];
};

export function CategoriesPage({ onSelectCategory, onClose }: CategoriesPageProps) {
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { language } = useSettings();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data: allCategories } = await supabase
      .from('categories')
      .select('*')
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

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    onSelectCategory(categoryId, categoryName);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 w-full md:max-w-2xl md:rounded-lg max-h-[80vh] overflow-hidden flex flex-col rounded-t-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('categories', language)}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {parentCategories.map((parentCategory) => {
            const isExpanded = expandedCategory === parentCategory.id;

            return (
              <div key={parentCategory.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : parentCategory.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {parentCategory.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">{translateCategoryName(parentCategory.name, language)}</div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleCategoryClick(parentCategory.id, parentCategory.name)}
                      className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700"
                    >
                      <div className="text-left">
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          {t('viewAll', language)} {translateCategoryName(parentCategory.name, language)}
                        </div>
                      </div>
                    </button>

                    {parentCategory.subcategories.map((subcat) => (
                      <button
                        key={subcat.id}
                        onClick={() => handleCategoryClick(subcat.id, subcat.name)}
                        className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="text-left pl-4">
                          <div className="font-medium text-gray-900 dark:text-white">{translateCategoryName(subcat.name, language)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
