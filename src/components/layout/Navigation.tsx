import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Home, Plus, Search, LogIn, Menu, SlidersHorizontal, Grid3x3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../lib/supabase';
import { CategoryDropdown } from '../navigation/CategoryDropdown';
import { UserMenu } from '../navigation/UserMenu';
import { t } from '../../utils/translations';

type NavigationProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowAuth?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNavigateToFilters?: () => void;
  onSearchSubmit?: (query: string) => void;
  showSearch?: boolean;
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

export function Navigation({
  currentPage,
  onNavigate,
  onShowAuth,
  searchQuery = '',
  onSearchChange,
  onNavigateToFilters,
  onSearchSubmit,
  showSearch = false,
}: NavigationProps) {
  const { user } = useAuth();
  const { language } = useSettings();
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (current > previous && current > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

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

  const handleCategoryNavigate = (categoryId: string, _categoryName: string) => {
    setCurrentCategoryId(categoryId);
    onNavigate(`category-${categoryId}`);
  };

  const mobileNavItems = [
    { id: 'home', label: t('browse', language), icon: Home },
    { id: 'categories', label: t('categories', language), icon: Grid3x3 },
    ...(user ? [{ id: 'create', label: t('sell', language), icon: Plus }] : []),
    ...(user ? [{ id: 'menu', label: t('menu', language), icon: Menu }] : []),
  ];

  return (
    <>
      <motion.header
        className="sticky top-0 z-40 shadow-lg"
        style={{ backgroundColor: 'var(--ds-card)' }}
        animate={{ y: hidden ? -200 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Top row: logo + nav + actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#2F6FED] to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <div className="w-5 h-5 border-2 border-white rounded-full" />
              </div>
              <span className="text-xl font-bold text-white">DiscSwap</span>
            </button>

            {/* Desktop category nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {parentCategories.map((parentCategory) => (
                <CategoryDropdown
                  key={parentCategory.id}
                  category={parentCategory}
                  subcategories={parentCategory.subcategories}
                  isActive={currentCategoryId === parentCategory.id}
                  onNavigate={handleCategoryNavigate}
                />
              ))}
              {/* Otsin (Wanted) nav item */}
              <button
                onClick={() => onNavigate('wanted-listings')}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors text-slate-300 hover:text-white hover:bg-white/10"
              >
                {t('otsin', language)}
              </button>
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => onNavigate('create')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:brightness-90"
                    style={{ backgroundColor: 'var(--ds-accent)' }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>{t('sell', language)}</span>
                  </button>
                  <UserMenu onNavigate={onNavigate} />
                </>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:brightness-90"
                  style={{ backgroundColor: 'var(--ds-accent)' }}
                >
                  <LogIn className="w-5 h-5" />
                  <span>{t('signIn', language)}</span>
                </button>
              )}
            </div>

            {/* Mobile header buttons */}
            <div className="md:hidden flex items-center gap-2">
              {!user && (
                <button
                  onClick={onShowAuth}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogIn className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search bar row — only on home page */}
        {showSearch && (
          <div className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('searchForDiscs', language)}
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onFocus={e => (e.currentTarget.style.border = '1px solid var(--ds-accent)')}
                    onBlur={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.12)')}
                  />
                </div>
                <button
                  onClick={onNavigateToFilters}
                  type="button"
                  className="px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <SlidersHorizontal className="w-5 h-5 text-slate-300" />
                </button>
              </form>
            </div>
          </div>
        )}
      </motion.header>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 shadow-2xl"
        style={{ backgroundColor: 'var(--ds-card)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="grid gap-1 px-2 py-2" style={{ gridTemplateColumns: `repeat(${mobileNavItems.length}, 1fr)` }}>
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'menu') {
                    setMobileMenuOpen(true);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all"
                style={{
                  color: isActive ? 'var(--ds-accent)' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(47, 111, 237, 0.12)' : 'transparent',
                }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile side menu */}
      {user && (
        <UserMenu
          onNavigate={onNavigate}
          externalOpen={mobileMenuOpen}
          onExternalClose={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
