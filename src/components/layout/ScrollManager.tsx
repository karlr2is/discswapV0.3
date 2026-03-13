import { useEffect, useRef } from 'react';

interface ScrollManagerProps {
  currentPage: string;
  pageHistory: unknown[];
}

const SCROLL_KEY = 'ds_home_scroll';
const FEED_PAGES = new Set(['home', 'filtered-results']);

export function ScrollManager({ currentPage, pageHistory }: ScrollManagerProps) {
  const prevPageRef = useRef(currentPage);
  const prevHistoryLen = useRef(pageHistory.length);

  useEffect(() => {
    const prevPage = prevPageRef.current;
    const prevLen  = prevHistoryLen.current;
    const currLen  = pageHistory.length;

    const leavingFeed   = FEED_PAGES.has(prevPage) && !FEED_PAGES.has(currentPage);
    const returningFeed = !FEED_PAGES.has(prevPage) && FEED_PAGES.has(currentPage);
    const goingBack     = currLen < prevLen;

    if (leavingFeed) {
      // Save the feed's current scroll position
      sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY)));
    }

    if (returningFeed && goingBack) {
      // Restore: content is still in DOM (HomePage always mounted)
      const saved = parseInt(sessionStorage.getItem(SCROLL_KEY) ?? '0', 10);
      // Use two rAFs to let React finish reconciliation before scrolling
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: saved, behavior: 'instant' as ScrollBehavior });
        });
      });
    } else if (!returningFeed || !goingBack) {
      // New forward navigation to a non-feed page → start at top
      if (!FEED_PAGES.has(currentPage)) {
        window.scrollTo(0, 0);
      }
    }

    prevPageRef.current    = currentPage;
    prevHistoryLen.current = currLen;
  }, [currentPage, pageHistory.length]);

  return null;
}
