import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { t } from '../../utils/translations';

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
};

type CategoryDropdownProps = {
  category: Category;
  subcategories: Category[];
  isActive: boolean;
  onNavigate: (categoryId: string, categoryName: string) => void;
};

export function CategoryDropdown({ category, subcategories, isActive, onNavigate }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useSettings();

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        onClick={() => onNavigate(category.id, category.name)}
        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'text-white bg-white/15'
            : 'text-slate-300 hover:text-white hover:bg-white/10'
        }`}
      >
        {category.name}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-1 pt-0 w-56 z-50 rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(10, 22, 35, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <div className="p-1.5">
              <button
                onClick={() => onNavigate(category.id, category.name)}
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors"
                style={{ color: 'var(--ds-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(47,111,237,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
              >
                {t('viewAll', language)} {category.name}
              </button>

              {subcategories.length > 0 && (
                <div className="mt-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  {subcategories.map((subcat) => (
                    <button
                      key={subcat.id}
                      onClick={() => onNavigate(subcat.id, subcat.name)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {subcat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
