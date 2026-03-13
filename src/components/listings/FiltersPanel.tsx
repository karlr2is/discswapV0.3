import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookmarkPlus, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { t } from '../../utils/translations';

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

type FiltersPanelProps = {
  onApplyFilters: (filters: FilterOptions) => void;
  onClose: () => void;
  initialFilters?: Partial<FilterOptions>;
};

const EMPTY: FilterOptions = {
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  minCondition: '',
  minSpeed: '',
  maxSpeed: '',
  location: '',
  listingType: '',
};

const inputClass =
  'w-full px-3 py-2 rounded-lg text-sm text-slate-100 focus:outline-none bg-white/8 border border-white/12 focus:border-[var(--ds-accent)] transition-colors placeholder-slate-500';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5';

export function FiltersPanel({ onApplyFilters, onClose, initialFilters }: FiltersPanelProps) {
  const { user } = useAuth();
  const { language } = useSettings();
  const [filters, setFilters] = useState<FilterOptions>({ ...EMPTY, ...initialFilters });
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [savedName, setSavedName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, parent_id')
      .order('name');

    if (data) {
      const parents = data.filter(c => c.parent_id === null);
      setParentCategories(
        parents.map(p => ({ ...p, subcategories: data.filter(c => c.parent_id === p.id) }))
      );
    }
  };

  const set = (key: keyof FilterOptions, val: string) =>
    setFilters(prev => ({ ...prev, [key]: val }));

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => setFilters(EMPTY);

  const handleSaveSearch = async () => {
    if (!user || !savedName.trim()) return;
    await supabase.from('saved_searches').insert({
      user_id: user.id,
      name: savedName.trim(),
      filters,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowSaveInput(false);
      setSavedName('');
    }, 1800);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-50 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />

        {/* Panel — slides in from right */}
        <motion.div
          className="relative ml-auto h-full flex flex-col shadow-2xl overflow-hidden"
          style={{
            width: 'min(420px, 100vw)',
            background: 'rgba(8, 18, 28, 0.92)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
          }}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-lg font-semibold text-white">{t('filters', language)}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded"
              >
                {t('clearAll', language)}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Listing type */}
            <div>
              <label className={labelClass}>{t('listingType', language)}</label>
              <select
                value={filters.listingType}
                onChange={e => set('listingType', e.target.value)}
                className={inputClass}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <option value="">{t('all', language)}</option>
                <option value="for_sale">{t('forSale', language)}</option>
                <option value="wanted">{t('wanted', language)}</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className={labelClass}>{t('category', language)}</label>
              <select
                value={filters.categoryId}
                onChange={e => set('categoryId', e.target.value)}
                className={inputClass}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <option value="">{t('allCategories', language)}</option>
                {parentCategories.map(parent => (
                  <optgroup key={parent.id} label={parent.name}>
                    <option value={parent.id}>{t('all', language)} {parent.name}</option>
                    {parent.subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className={labelClass}>{t('priceRange', language)}</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number" placeholder={t('min', language)} value={filters.minPrice}
                  onChange={e => set('minPrice', e.target.value)}
                  className={inputClass} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
                <input
                  type="number" placeholder={t('max', language)} value={filters.maxPrice}
                  onChange={e => set('maxPrice', e.target.value)}
                  className={inputClass} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className={labelClass}>{t('minimumCondition', language)}</label>
              <select
                value={filters.minCondition}
                onChange={e => set('minCondition', e.target.value)}
                className={inputClass}
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <option value="">{t('anyCondition', language)}</option>
                {[9, 8, 7, 6, 5].map(v => (
                  <option key={v} value={String(v)}>{t(`condition${v}` as any, language)}</option>
                ))}
              </select>
            </div>

            {/* Disc speed */}
            <div>
              <label className={labelClass}>{t('discSpeedRange', language)}</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number" placeholder={t('minSpeed', language)} min="1" max="14"
                  value={filters.minSpeed} onChange={e => set('minSpeed', e.target.value)}
                  className={inputClass} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
                <input
                  type="number" placeholder={t('maxSpeed', language)} min="1" max="14"
                  value={filters.maxSpeed} onChange={e => set('maxSpeed', e.target.value)}
                  className={inputClass} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={labelClass}>{t('location', language)}</label>
              <input
                type="text" placeholder={t('enterLocation', language)} value={filters.location}
                onChange={e => set('location', e.target.value)}
                className={inputClass} style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              />
            </div>

            {/* Save search (logged-in only) */}
            {user && (
              <div>
                <div className="border-t border-white/8 pt-4">
                  {!showSaveInput ? (
                    <button
                      onClick={() => setShowSaveInput(true)}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      Save this search
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search name…"
                        value={savedName}
                        onChange={e => setSavedName(e.target.value)}
                        className={inputClass}
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveSearch}
                        disabled={!savedName.trim() || savedSuccess}
                        className="w-full py-2 rounded-lg text-sm font-medium text-white transition-all flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: savedSuccess ? '#16a34a' : 'var(--ds-accent)',
                          opacity: !savedName.trim() ? 0.5 : 1,
                        }}
                      >
                        {savedSuccess ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Search'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={handleApply}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:brightness-90 active:scale-98"
              style={{ backgroundColor: 'var(--ds-accent)' }}
            >
              {t('applyFilters', language)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
