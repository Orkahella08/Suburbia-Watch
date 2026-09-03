import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [featuredItems.length]);

  if (!featuredItems || featuredItems.length === 0) return null;

  const current = featuredItems[currentIndex] || featuredItems[0];
  const inWatchlist = watchlist.includes(current.id);

  return (
    <section
      id="curated-hero"
      className="relative w-full border-b-2 border-[#141414] bg-[#E8E5DC] text-[#141414] overflow-hidden"
    >
      {/* Top Editorial Banner Stamp */}
      <div className="border-b border-[#141414]/20 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#141414]" />
          <span className="font-bold tracking-widest uppercase">
            SUBURBIA WATCH — ARCHIVAL REPERTORY
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[#57534E]">
          <span className="uppercase tracking-wider">A CURATED COLLECTION OF CINEMA</span>
          <span>•</span>
          <span className="uppercase tracking-wider font-semibold text-[#141414]">
            ISSUE NO. 24 · AUTUMN REPERTOIRE
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left / Hero Editorial Content (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            {/* Curated Tag & Provider */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#57534E] mb-2 uppercase tracking-widest">
              <span className="bg-[#141414] text-[#FAF9F6] px-2 py-0.5 font-bold">
                {current.type === 'tv' ? 'TELEVISION SERIAL' : 'FEATURE PRINT'}
              </span>
              <span>•</span>
              <span className="font-semibold text-[#141414]">
                ON {current.streamingProvider.toUpperCase()}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-condensed text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#141414] leading-[0.95] mb-2">
              {current.title}
            </h1>

            {/* Tagline or Year */}
            <div className="flex items-baseline gap-3 text-sm font-mono text-[#57534E] mb-4">
              <span className="font-bold text-[#141414] text-base">{current.releaseYear}</span>
              <span>•</span>
              <span>{current.genres.join(' · ')}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#141414] font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {current.imdbRating}
              </span>
            </div>

            {/* Editorial Description */}
            <p className="font-serif-editorial text-sm sm:text-base text-[#141414] leading-relaxed mb-6 line-clamp-3">
              {current.synopsis}
            </p>

            {/* Rectangular Action Buttons (Section 18) */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onPlay(current)}
                className="bg-[#141414] text-[#FAF9F6] px-6 py-3 font-condensed uppercase tracking-widest font-bold text-xs hover:bg-[#2B2A27] transition-colors flex items-center gap-2 cursor-pointer border border-[#141414]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>WATCH NOW</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDetails(current)}
                className="bg-transparent text-[#141414] px-5 py-3 font-condensed uppercase tracking-widest text-xs hover:bg-[#141414]/10 transition-colors border border-[#141414] flex items-center gap-1.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>FILM DOSSIER</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWatchlist(current)}
                className="p-3 border border-[#141414] hover:bg-[#141414] hover:text-[#FAF9F6] transition-colors cursor-pointer"
                title={inWatchlist ? 'In Archive Index' : 'Save to Index'}
              >
                {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>

            {/* Archival Slide Toggles */}
            <div className="mt-8 pt-4 border-t border-[#141414]/20 flex items-center justify-between">
              <div className="text-[11px] font-mono text-[#78716C] uppercase tracking-wider">
                FEATURED ARCHIVE {currentIndex + 1} OF {featuredItems.length}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex(
                      (prev) => (prev - 1 + featuredItems.length) % featuredItems.length
                    )
                  }
                  className="p-1 border border-[#141414] hover:bg-[#141414] hover:text-[#FAF9F6] transition-colors cursor-pointer"
                  aria-label="Previous featured film"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
                  className="p-1 border border-[#141414] hover:bg-[#141414] hover:text-[#FAF9F6] transition-colors cursor-pointer"
                  aria-label="Next featured film"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right / 16:9 Cinematic Landscape Artwork (7 columns) - Section 16 */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div
              className="relative w-full aspect-[16/9] bg-[#141414] border-2 border-[#141414] overflow-hidden shadow-md cursor-pointer group"
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
              <div className="absolute top-3 left-3 text-[10px] font-mono uppercase bg-[#141414]/90 text-[#FAF9F6] px-2 py-0.5 border border-white/20">
                {current.type === 'movie' ? 'FEATURE FILM' : 'TELEVISION SERIES'} · {current.releaseYear}
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] font-mono uppercase bg-[#FAF9F6]/95 text-[#141414] px-2 py-0.5 font-bold border border-[#141414]">
                35MM REPERTORY PRINT
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
