import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type HorizontalCarouselProps = {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
  /** Number of items (used to decide whether to show nav arrows on desktop) */
  itemCount?: number;
};

export function HorizontalCarousel({
  title,
  onSeeAll,
  children,
  itemCount = 0,
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-3">
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        <div className="flex items-center gap-2">
          {/* Desktop arrow buttons */}
          {itemCount > 2 && (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {onSeeAll && (
            <button
              onClick={onSeeAll}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--ds-accent)' }}
            >
              See all →
            </button>
          )}
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>
    </section>
  );
}

/** Wrapper for a single card in the carousel — enforces fixed width + snap */
export function CarouselItem({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex-shrink-0"
      style={{
        width: 'clamp(150px, 42vw, 220px)',
        scrollSnapAlign: 'start',
      }}
    >
      {children}
    </div>
  );
}
