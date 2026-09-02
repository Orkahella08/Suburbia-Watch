import React, { useRef, useState, useEffect } from 'react';
import { MediaItem, WatchProgress } from '../types';
import { MediaCard } from './MediaCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaRowProps {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  progressMap?: Record<string, WatchProgress>;
  onRemoveProgress?: (mediaId: string) => void;
  aspectRatio?: 'poster' | 'backdrop';
}

export const MediaRow: React.FC<MediaRowProps> = ({
  id,
  title,
  subtitle,
  badge,
  items,
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
  progressMap,
  onRemoveProgress,
  aspectRatio = 'backdrop',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section id={`row-${id}`} className="relative py-4 sm:py-6 group/row">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 sm:mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
              {title}
            </h2>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-1.5 rounded-full border border-zinc-800 transition-all ${
              canScrollLeft
                ? 'bg-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer'
                : 'bg-zinc-950/40 text-zinc-600 border-zinc-900 cursor-not-allowed opacity-40'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-1.5 rounded-full border border-zinc-800 transition-all ${
              canScrollRight
                ? 'bg-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer'
                : 'bg-zinc-950/40 text-zinc-600 border-zinc-900 cursor-not-allowed opacity-40'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row Scrolling Area */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-3 pt-1 cinema-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {items.map((item) => (
            <div key={item.id} className="snap-start">
              <MediaCard
                item={item}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                inWatchlist={watchlist.includes(item.id)}
                onToggleWatchlist={onToggleWatchlist}
                progress={progressMap ? progressMap[item.id] : undefined}
                onRemoveProgress={onRemoveProgress}
                aspectRatio={aspectRatio}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
