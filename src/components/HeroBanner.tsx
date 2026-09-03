import React, { useState, useEffect, useMemo } from 'react';
import { MediaItem } from '../types';
import { Play, Bookmark, BookmarkCheck, Info, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { PosterImage } from './PosterImage';

interface HeroBannerProps {
  featuredItems: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredItems,
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMonthYear = useMemo(() => {
    try {
      return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
    } catch {
      return 'THIS MONTH';
    }
  }, []);

  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [featuredItems.length]);

  if (!featuredItems || featuredItems.length === 0) return null;

  const current = featuredItems[currentIndex] || featuredItems[0];
  const inWatchlist = watchlist.includes(current.id);

  return (
    <section
      id="curated-hero"
      className="relative w-full border-b-2 border-[#141414] dark:border-[#27272A] bg-[#E8E5DC] dark:bg-[#111114] text-[#141414] dark:text-[#F4F4F5] overflow-hidden transition-colors"
    >
      {/* Top Editorial Banner Stamp */}
      <div className="border-b border-[#141414]/20 dark:border-[#27272A] px-4 sm:px-8 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#E50914] animate-pulse" />
          <span className="font-bold tracking-widest uppercase text-[#141414] dark:text-[#F4F4F5]">
            MONTHLY STREAMING RADAR — {currentMonthYear}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[#57534E] dark:text-[#A1A1AA]">
          <span className="uppercase tracking-wider font-semibold text-[#141414] dark:text-[#F4F4F5]">
            FAMOUSLY WATCHED & NEWEST RELEASES
          </span>
          <span>•</span>
          <span className="uppercase tracking-wider">
            UPDATED HOURLY
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left / Hero Editorial Content (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            {/* Curated Tag & Provider */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono mb-2 uppercase tracking-widest">
              <span className="bg-[#E50914] text-white px-2 py-0.5 font-bold text-[11px] shadow-sm">
                #{currentIndex + 1} MOST-WATCHED THIS MONTH
              </span>
              <span className="bg-[#141414] dark:bg-[#27272A] text-[#FAF9F6] px-2 py-0.5 font-bold text-[11px]">
                {current.type === 'tv' ? 'SERIES' : 'FEATURE FILM'}
              </span>
              <span>•</span>
              <span className="font-semibold text-[#141414] dark:text-[#F4F4F5]">
                {current.streamingProvider.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-condensed text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5] leading-[0.95] mb-2">
              {current.title}
            </h1>

            {/* Tagline or Year */}
            <div className="flex items-baseline gap-3 text-sm font-mono text-[#57534E] dark:text-[#A1A1AA] mb-4 flex-wrap">
              <span className="font-bold text-[#141414] dark:text-[#F4F4F5] text-base">{current.releaseYear}</span>
              <span>•</span>
              <span>{current.genres.slice(0, 3).join(' · ')}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#141414] dark:text-[#F4F4F5] font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {current.imdbRating}
              </span>
            </div>

            {/* Editorial Description */}
            <p className="font-serif-editorial text-sm sm:text-base text-[#141414] dark:text-[#D4D4D8] leading-relaxed mb-6 line-clamp-3">
              {current.synopsis}
            </p>

            {/* Rectangular Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onPlay(current)}
                className="bg-[#141414] dark:bg-[#F4F4F5] text-[#FAF9F6] dark:text-[#141414] hover:bg-[#2B2A27] dark:hover:bg-white px-6 py-3 font-condensed uppercase tracking-widest font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-[#141414] dark:border-[#F4F4F5] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] dark:shadow-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>WATCH NOW</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDetails(current)}
                className="bg-transparent text-[#141414] dark:text-[#F4F4F5] px-5 py-3 font-condensed uppercase tracking-widest text-xs hover:bg-[#141414]/10 dark:hover:bg-[#27272A] transition-colors border border-[#141414] dark:border-[#3F3F46] flex items-center gap-1.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>FILM DOSSIER</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWatchlist(current)}
                className="p-3 border border-[#141414] dark:border-[#3F3F46] hover:bg-[#141414] hover:text-[#FAF9F6] dark:hover:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] transition-colors cursor-pointer"
                title={inWatchlist ? 'In Archive Index' : 'Save to Index'}
              >
                {inWatchlist ? <BookmarkCheck className="w-4 h-4 text-[#E50914]" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>

            {/* Archival Slide Toggles */}
            <div className="mt-8 pt-4 border-t border-[#141414]/20 dark:border-[#27272A] flex items-center justify-between">
              <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A1A1AA] uppercase tracking-wider">
                TITLE {currentIndex + 1} OF {featuredItems.length} · {currentMonthYear} PICKS
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex(
                      (prev) => (prev - 1 + featuredItems.length) % featuredItems.length
                    )
                  }
                  className="p-1 border border-[#141414] dark:border-[#3F3F46] hover:bg-[#141414] hover:text-[#FAF9F6] dark:hover:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] transition-colors cursor-pointer"
                  aria-label="Previous film"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
                  className="p-1 border border-[#141414] dark:border-[#3F3F46] hover:bg-[#141414] hover:text-[#FAF9F6] dark:hover:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] transition-colors cursor-pointer"
                  aria-label="Next film"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right / 16:9 Cinematic Landscape Artwork */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div
              className="relative w-full aspect-[16/9] bg-[#141414] border-2 border-[#141414] dark:border-[#27272A] overflow-hidden shadow-md cursor-pointer group"
              onClick={() => onOpenDetails(current)}
            >
              <PosterImage
                src={current.backdropUrl || current.posterUrl}
                alt={current.title}
                imdbId={current.imdbId}
                title={current.title}
                year={current.releaseYear}
                aspectRatio="16/9"
                loading="eager"
                imgClassName="film-photo-treatment transition-transform duration-500 group-hover:scale-105"
              />

              {/* Editorial Frame Markings */}
              <div className="absolute top-3 left-3 text-[10px] font-mono uppercase bg-[#141414]/90 text-[#FAF9F6] px-2.5 py-1 border border-white/20 flex items-center gap-1.5 font-bold">
                <span className="w-1.5 h-1.5 bg-[#E50914] rounded-full" />
                {currentMonthYear} HIT · {current.releaseYear}
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] font-mono uppercase bg-[#FAF9F6]/95 dark:bg-[#18181B]/95 text-[#141414] dark:text-[#F4F4F5] px-2 py-0.5 font-bold border border-[#141414] dark:border-[#3F3F46]">
                POPULAR STREAMING PRINT
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
