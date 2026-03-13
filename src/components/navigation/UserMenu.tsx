import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, User, Settings, Heart, LogOut, List as ListIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { t } from '../../utils/translations';

type UserMenuProps = {
  onNavigate: (page: string) => void;
  externalOpen?: boolean;
  onExternalClose?: () => void;
};

const menuItems = [
  { id: 'messages',    icon: MessageSquare, labelKey: 'messages'   },
  { id: 'my-listings', icon: ListIcon,      labelKey: 'myListings' },
  { id: 'favorites',  icon: Heart,          labelKey: 'favorites'  },
  { id: 'profile',    icon: User,           labelKey: 'profile'    },
  { id: 'settings',   icon: Settings,       labelKey: 'settings'   },
] as const;

export function UserMenu({ onNavigate, externalOpen, onExternalClose }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { language } = useSettings();

  const menuOpen = externalOpen !== undefined ? externalOpen : isOpen;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  if (!user) return null;

  const closeMenu = () => {
    onExternalClose ? onExternalClose() : setIsOpen(false);
  };

  const handleNavigate = (page: string) => {
    closeMenu();
    onNavigate(page);
  };

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  const showButton = externalOpen === undefined;

  return (
    <>
      {showButton && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm transition-all hover:ring-2 hover:ring-white/30 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--ds-accent), #1a5bd4)' }}
          aria-label="User menu"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            profile?.username?.charAt(0).toUpperCase() || 'U'
          )}
        </button>
      )}

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
              onClick={closeMenu}
            />

            {/* Side panel — glass, auto-width */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
              style={{
                width: 'min(280px, 85vw)',
                background: 'rgba(10, 22, 35, 0.85)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--ds-accent), #1a5bd4)' }}
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                      profile?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{profile?.username}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[140px]">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {menuItems.map(({ id, icon: Icon, labelKey }) => (
                  <button
                    key={id}
                    onClick={() => handleNavigate(id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{t(labelKey, language)}</span>
                  </button>
                ))}
              </nav>

              {/* Sign out */}
              <div className="px-3 pb-6 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>{t('logout', language)}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
