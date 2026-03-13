import { Navigation } from './Navigation';

type LayoutProps = {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onShowAuth?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNavigateToFilters?: () => void;
  showSearch?: boolean;
};

export function Layout({
  children,
  currentPage,
  onNavigate,
  onShowAuth,
  searchQuery = '',
  onSearchChange,
  onNavigateToFilters,
  showSearch = false,
}: LayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ds-bg)' }}>
      <Navigation
        currentPage={currentPage}
        onNavigate={onNavigate}
        onShowAuth={onShowAuth}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onNavigateToFilters={onNavigateToFilters}
        showSearch={showSearch}
      />
      <main className="pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}

