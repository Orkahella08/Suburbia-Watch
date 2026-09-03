import React, { useState, useMemo } from 'react';
import { MarvelItem, MarvelOrderMode, MediaItem } from '../types';
import { MARVEL_MEDIA_ITEMS, UPCOMING_MARVEL_ITEMS } from '../data/marvelData';
import {
  Play,
  Film,
  Tv,
  Calendar,
  Clock,
  Star,
  Info,
  Sparkles,
  Search,
  Filter,
  Flame,
  Bookmark,
  BookmarkCheck,
  Layers,
  Compass,
} from 'lucide-react';
import { PosterImage } from './PosterImage';

interface MarvelModeViewProps {
  onPlay: (item: MediaItem, seasonNumber?: number, episodeId?: string) => void;
  onOpenDetails: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
}

export const MarvelModeView: React.FC<MarvelModeViewProps> = ({
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
}) => {
  const [orderMode, setOrderMode] = useState<MarvelOrderMode>('chronological');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [filterSaga, setFilterSaga] = useState<'all' | 'The Infinity Saga' | 'The Multiverse Saga'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Latest releases
  const latestReleases = useMemo(
    () => MARVEL_MEDIA_ITEMS.filter((item) => item.isLatestRelease),
    []
  );

  // Sorted and filtered items
  const displayedItems = useMemo(() => {
    let result = [...MARVEL_MEDIA_ITEMS];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.timelinePeriod.toLowerCase().includes(q) ||
          item.storyPhase.toLowerCase().includes(q) ||
          item.cast.some((c) => c.name.toLowerCase().includes(q))
      );
    }

    // Media type filter
    if (filterType !== 'all') {
      result = result.filter((item) => item.type === filterType);
    }

    // Saga filter
    if (filterSaga !== 'all') {
      result = result.filter((item) => item.saga === filterSaga);
    }

    // Order mode
    if (orderMode === 'chronological') {
      result.sort((a, b) => a.chronologicalOrder - b.chronologicalOrder);
    } else {
      // Story / Phase Order
      result.sort((a, b) => a.storyOrder - b.storyOrder);
    }

    return result;
  }, [orderMode, filterType, filterSaga, searchQuery]);

  return (
    <div id="marvel-mode-container" className="min-h-screen pb-20">
      {/* 1. MARVEL CINEMATIC HEADER BANNER */}
      <div className="bg-[#E62429] text-[#FAF9F6] border-b-2 border-[#141414] dark:border-[#27272A] px-4 sm:px-8 py-8 sm:py-12 relative overflow-hidden shadow-lg">
        {/* Background Atmospheric Watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-10 font-black text-9xl uppercase tracking-tighter text-white font-condensed">
          MARVEL
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/90 mb-3">
            <span className="bg-[#141414] text-white px-2.5 py-1 font-bold tracking-widest">
              OFFICIAL MCU TIMELINE
            </span>
            <span>•</span>
            <span className="font-semibold">THE INFINITY SAGA & MULTIVERSE SAGA</span>
            <span>•</span>
            <span>TOTAL {MARVEL_MEDIA_ITEMS.length} TITLES STREAMING</span>
          </div>

          <h1 className="font-condensed text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none mb-4 drop-shadow-sm">
            MARVEL CINEMATIC UNIVERSE
          </h1>

          <p className="font-serif-editorial text-base sm:text-lg text-white/90 max-w-3xl leading-relaxed mb-6">
            Explore every chapter of the Marvel Cinematic Universe in two distinct viewing experiences:
            <strong> Chronological Order</strong> (by in-universe timeline years from 1942 to 2026) or
            <strong> Story Mode</strong> (by Marvel release phases and overarching narrative arcs).
          </p>

          {/* VIEWING MODE TOGGLE BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="text-xs font-mono uppercase tracking-wider text-white/80 mr-1 self-center">
              CHOOSE WATCH MODE:
            </div>

            <button
              type="button"
              onClick={() => setOrderMode('chronological')}
              className={`px-5 py-3 font-condensed uppercase tracking-wider text-sm font-bold flex items-center gap-2 cursor-pointer border-2 transition-all ${
                orderMode === 'chronological'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)]'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>CHRONOLOGICAL ORDER (TIMELINE)</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderMode('story')}
              className={`px-5 py-3 font-condensed uppercase tracking-wider text-sm font-bold flex items-center gap-2 cursor-pointer border-2 transition-all ${
                orderMode === 'story'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] shadow-[3px_3px_0px_0px_rgba(255,255,255,0.9)]'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>STORY MODE (PHASES 1–6)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* 2. LATEST RELEASES THAT CAN BE WATCHED (User requirement) */}
        <section id="marvel-latest-releases" className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#141414] dark:border-[#27272A] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 bg-[#E62429]" />
              <h2 className="font-condensed text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5]">
                LATEST RELEASES AVAILABLE TO WATCH NOW
              </h2>
            </div>
            <span className="text-xs font-mono uppercase text-[#E62429] dark:text-[#FF5C5C] font-bold tracking-wider">
              STREAMING IN FULL HD
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestReleases.map((item) => {
              const inWatchlist = watchlist.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-[#F4F1EA] dark:bg-[#18181B] border-2 border-[#141414] dark:border-[#27272A] p-5 sm:p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="bg-[#E62429] text-white text-[11px] font-mono uppercase px-2 py-0.5 font-bold tracking-wider">
                        ★ LATEST RELEASE
                      </span>
                      <span className="text-xs font-mono text-[#57534E] dark:text-[#A1A1AA]">
                        {item.releaseDate}
                      </span>
                    </div>

                    {/* Media Title & Metadata */}
                    <h3 className="font-condensed text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5] mb-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs font-mono text-[#57534E] dark:text-[#A1A1AA] mb-4">
                      <span className="font-bold text-[#141414] dark:text-[#F4F4F5]">
                        {item.releaseYear}
                      </span>
                      <span>•</span>
                      <span className="bg-[#141414] text-white dark:bg-[#27272A] px-1.5 py-0.5 text-[10px]">
                        {item.storyPhase}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#141414] dark:text-[#F4F4F5] font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {item.imdbRating}
                      </span>
                      <span>•</span>
                      <span>{item.duration}</span>
                    </div>

                    <p className="font-serif-editorial text-sm text-[#141414] dark:text-[#D4D4D8] leading-relaxed mb-6 line-clamp-3">
                      {item.synopsis}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#141414]/15 dark:border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => onPlay(item)}
                      className="bg-[#E62429] hover:bg-[#C91F24] text-white px-5 py-2.5 font-condensed uppercase tracking-wider font-bold text-xs flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] dark:shadow-none"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>WATCH NOW</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetails(item)}
                      className="border border-[#141414] dark:border-[#3F3F46] hover:bg-[#141414] hover:text-white dark:hover:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] px-4 py-2.5 font-condensed uppercase tracking-wider text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>FILM DOSSIER</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleWatchlist(item)}
                      className="p-2.5 border border-[#141414] dark:border-[#3F3F46] hover:bg-[#141414] hover:text-white dark:hover:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] transition-colors cursor-pointer ml-auto"
                      title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    >
                      {inWatchlist ? (
                        <BookmarkCheck className="w-4 h-4 text-[#E62429]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. UPCOMING MARVEL RELEASES (User requirement) */}
        <section id="marvel-upcoming-releases" className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#141414] dark:border-[#27272A] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 bg-[#113CCF]" />
              <h2 className="font-condensed text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5]">
                UPCOMING MARVEL PREMIERES & CINEMA SLATE
              </h2>
            </div>
            <span className="text-xs font-mono uppercase text-[#57534E] dark:text-[#A1A1AA]">
              THE MULTIVERSE SAGA PHASES 5 & 6
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {UPCOMING_MARVEL_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-[#E8E5DC] dark:bg-[#1C1C20] border-2 border-[#141414] dark:border-[#27272A] p-5 flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] dark:shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#E62429] dark:text-[#FF5C5C] font-bold uppercase mb-2">
                    <span>{item.upcomingDate}</span>
                    <span className="bg-[#113CCF] text-white px-2 py-0.5 text-[10px]">
                      {item.storyPhase}
                    </span>
                  </div>

                  <h3 className="font-condensed text-xl font-bold uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5] mb-2">
                    {item.title}
                  </h3>

                  <p className="font-serif-editorial text-xs text-[#57534E] dark:text-[#A1A1AA] leading-relaxed mb-4 line-clamp-3">
                    {item.synopsis}
                  </p>

                  <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A1A1AA] mb-4">
                    <span className="font-semibold text-[#141414] dark:text-[#F4F4F5]">CAST: </span>
                    {item.cast.map((c) => c.name).join(', ')}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#141414]/15 dark:border-[#27272A] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onPlay(item)}
                    className="bg-[#141414] text-white dark:bg-[#27272A] dark:hover:bg-[#3F3F46] hover:bg-[#2B2A27] px-3.5 py-1.5 font-condensed uppercase tracking-wider text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>PREVIEW TEASER</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDetails(item)}
                    className="text-xs font-mono uppercase text-[#141414] dark:text-[#F4F4F5] hover:underline cursor-pointer"
                  >
                    DETAILS →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. ALL MARVEL MOVIES AND SERIES IN STORY / CHRONOLOGICAL ORDER */}
        <section id="marvel-all-titles" className="space-y-6">
          {/* Section Heading & Interactive Controls */}
          <div className="border-b-2 border-[#141414] dark:border-[#27272A] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E62429] dark:text-[#FF5C5C] font-bold mb-1">
                <span>{orderMode === 'chronological' ? 'ORDERED CHRONOLOGICALLY BY TIMELINE' : 'ORDERED BY MARVEL STORY PHASES'}</span>
              </div>
              <h2 className="font-condensed text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5]">
                ALL MARVEL MOVIES & SERIES ({displayedItems.length})
              </h2>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search box */}
              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Marvel heroes..."
                  className="w-full bg-[#FAF9F6] dark:bg-[#18181B] border border-[#141414] dark:border-[#3F3F46] pl-8 pr-3 py-1.5 text-xs font-mono text-[#141414] dark:text-[#F4F4F5] focus:outline-none focus:ring-1 focus:ring-[#E62429]"
                />
              </div>

              {/* Format Filter */}
              <div className="flex items-center border border-[#141414] dark:border-[#3F3F46] bg-[#FAF9F6] dark:bg-[#18181B] text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1.5 cursor-pointer uppercase ${
                    filterType === 'all'
                      ? 'bg-[#141414] text-white font-bold'
                      : 'text-[#57534E] dark:text-[#A1A1AA] hover:bg-[#141414]/10'
                  }`}
                >
                  ALL
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('movie')}
                  className={`px-2.5 py-1.5 cursor-pointer uppercase border-l border-[#141414]/20 dark:border-[#3F3F46] ${
                    filterType === 'movie'
                      ? 'bg-[#141414] text-white font-bold'
                      : 'text-[#57534E] dark:text-[#A1A1AA] hover:bg-[#141414]/10'
                  }`}
                >
                  MOVIES
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('tv')}
                  className={`px-2.5 py-1.5 cursor-pointer uppercase border-l border-[#141414]/20 dark:border-[#3F3F46] ${
                    filterType === 'tv'
                      ? 'bg-[#141414] text-white font-bold'
                      : 'text-[#57534E] dark:text-[#A1A1AA] hover:bg-[#141414]/10'
                  }`}
                >
                  SERIES
                </button>
              </div>

              {/* Saga Filter */}
              <select
                value={filterSaga}
                onChange={(e) => setFilterSaga(e.target.value as any)}
                className="bg-[#FAF9F6] dark:bg-[#18181B] border border-[#141414] dark:border-[#3F3F46] px-2.5 py-1.5 text-xs font-mono text-[#141414] dark:text-[#F4F4F5] uppercase cursor-pointer focus:outline-none"
              >
                <option value="all">ALL SAGAS</option>
                <option value="The Infinity Saga">INFINITY SAGA</option>
                <option value="The Multiverse Saga">MULTIVERSE SAGA</option>
              </select>
            </div>
          </div>

          {/* Titles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedItems.map((item, idx) => {
              const inWatchlist = watchlist.includes(item.id);
              const orderIndex = orderMode === 'chronological' ? item.chronologicalOrder : item.storyOrder;
              const badgeLabel =
                orderMode === 'chronological'
                  ? `#${orderIndex} · ${item.chronologicalYear}`
                  : `${item.storyPhase} · #${orderIndex}`;

              return (
                <div
                  key={item.id}
                  className="bg-[#F4F1EA] dark:bg-[#18181B] border-2 border-[#141414] dark:border-[#27272A] flex flex-col justify-between group shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] dark:shadow-none transition-transform hover:-translate-y-1"
                >
                  <div>
                    {/* Poster with Order Stamp */}
                    <div
                      className="relative aspect-[16/9] sm:aspect-[3/2] overflow-hidden bg-[#141414] border-b-2 border-[#141414] dark:border-[#27272A] cursor-pointer"
                      onClick={() => onOpenDetails(item)}
                    >
                      <PosterImage
                        src={item.posterUrl || item.backdropUrl}
                        alt={item.title}
                        imdbId={item.imdbId}
                        title={item.title}
                        year={item.releaseYear}
                        aspectRatio="3/2"
                        imgClassName="transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Order Stamp Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-[#E62429] text-white text-[11px] font-mono font-bold px-2 py-0.5 shadow-sm uppercase tracking-wider">
                        {badgeLabel}
                      </div>

                      {/* Provider Badge */}
                      <div className="absolute bottom-2.5 right-2.5 bg-[#141414]/90 text-white text-[10px] font-mono px-2 py-0.5 border border-white/20">
                        {item.type === 'movie' ? 'MOVIE' : 'SERIES'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A1A1AA] uppercase tracking-wider">
                        {item.timelinePeriod}
                      </div>

                      <h3
                        onClick={() => onOpenDetails(item)}
                        className="font-condensed text-xl font-bold uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5] line-clamp-1 hover:text-[#E62429] cursor-pointer"
                      >
                        {item.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs font-mono text-[#57534E] dark:text-[#A1A1AA]">
                        <span>RELEASE: {item.releaseYear}</span>
                        <span className="flex items-center gap-1 font-bold text-[#141414] dark:text-[#F4F4F5]">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          {item.imdbRating}
                        </span>
                      </div>

                      <p className="font-serif-editorial text-xs text-[#57534E] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">
                        {item.synopsis}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-2 border-t border-[#141414]/15 dark:border-[#27272A] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onPlay(item)}
                      className="bg-[#E62429] hover:bg-[#C91F24] text-white px-3 py-1.5 font-condensed uppercase tracking-wider font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_0px_rgba(20,20,20,1)] dark:shadow-none"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>WATCH</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenDetails(item)}
                        className="px-2.5 py-1.5 border border-[#141414] dark:border-[#3F3F46] text-[#141414] dark:text-[#F4F4F5] hover:bg-[#141414] hover:text-white dark:hover:bg-[#27272A] font-condensed uppercase text-xs cursor-pointer"
                      >
                        DOSSIER
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleWatchlist(item)}
                        className="p-1.5 border border-[#141414] dark:border-[#3F3F46] text-[#141414] dark:text-[#F4F4F5] hover:bg-[#141414] hover:text-white dark:hover:bg-[#27272A] cursor-pointer"
                        title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                      >
                        {inWatchlist ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#E62429]" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
