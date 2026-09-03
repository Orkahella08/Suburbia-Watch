import React, { useState, useMemo } from 'react';
import { MediaItem, StreamingProvider } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { Sparkles, Film, Tv, Flame, RefreshCcw, Check, Play, ArrowRight } from 'lucide-react';
import { extractImdbId } from '../utils/imdb';

export interface PlatformExplorerProps {
  items: MediaItem[];
  onPlay: (item: MediaItem, seasonNumber?: number, episodeId?: string) => void;
  onOpenDetails: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
}

interface PlatformConfig {
  id: string;
  name: StreamingProvider;
  shortName: string;
  badge: string;
  brandColor: string;
  accentBg: string;
  borderColor: string;
  description: string;
}

export const POPULAR_PLATFORMS: PlatformConfig[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    shortName: 'Netflix',
    badge: 'N',
    brandColor: '#E50914',
    accentBg: '#E50914',
    borderColor: '#E50914',
    description: 'Popular Netflix Originals, trending blockbusters & binge-worthy drama.',
  },
  {
    id: 'disney',
    name: 'Disney+',
    shortName: 'Disney+',
    badge: 'D+',
    brandColor: '#113CCF',
    accentBg: '#113CCF',
    borderColor: '#113CCF',
    description: 'Marvel Cinematic Universe, Star Wars, Pixar & Disney Animation classics.',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    shortName: 'Hulu',
    badge: 'H',
    brandColor: '#1CE783',
    accentBg: '#059669',
    borderColor: '#10B981',
    description: 'Award-winning television, Emmy powerhouses & cutting-edge series.',
  },
  {
    id: 'hbo',
    name: 'HBO Max',
    shortName: 'HBO Max',
    badge: 'MAX',
    brandColor: '#9E3FFD',
    accentBg: '#7C3AED',
    borderColor: '#8B5CF6',
    description: 'Prestige HBO television, Warner Bros. cinema & epic franchise sagas.',
  },
  {
    id: 'prime',
    name: 'Amazon Prime Video',
    shortName: 'Prime Video',
    badge: 'PV',
    brandColor: '#00A8E1',
    accentBg: '#0284C7',
    borderColor: '#0284C7',
    description: 'Global smash hits, high-octane action & visionary sci-fi spectacles.',
  },
  {
    id: 'apple',
    name: 'Apple TV+',
    shortName: 'Apple TV+',
    badge: 'TV+',
    brandColor: '#141414',
    accentBg: '#27272A',
    borderColor: '#52525B',
    description: 'Critically acclaimed auteur filmmaking, celebrated sci-fi & comedy.',
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    shortName: 'Crunchyroll',
    badge: 'CR',
    brandColor: '#F47521',
    accentBg: '#F47521',
    borderColor: '#EA580C',
    description: 'World’s premier anime destination featuring simulcasts, shonen epics & movies.',
  },
  {
    id: 'bilibili',
    name: 'Bilibili',
    shortName: 'Bili Bili',
    badge: 'BILI',
    brandColor: '#00A1D6',
    accentBg: '#00A1D6',
    borderColor: '#0284C7',
    description: 'Leading East Asian animation powerhouse with top-rated donghua & fantasy sagas.',
  },
];

const AVAILABLE_GENRES = [
  'All Genres',
  'Action',
  'Drama',
  'Sci-Fi',
  'Comedy',
  'Crime',
  'Thriller',
  'Adventure',
  'Animation',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Biography',
];

export const StreamingPlatformExplorer: React.FC<PlatformExplorerProps> = ({
  items,
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
  onSelectActor,
}) => {
  // Filter States
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All Genres');
  const [minImdbRating, setMinImdbRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'imdb' | 'popular' | 'newest'>('imdb');

  // Compute platform highest IMDb rating for badges
  const platformTopRatings = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of POPULAR_PLATFORMS) {
      let maxRating = 0;
      for (const item of items) {
        const matchPrimary =
          item.streamingProvider?.toLowerCase().includes(p.shortName.toLowerCase()) ||
          item.streamingProvider?.toLowerCase().includes(p.name.toLowerCase());
        const matchAvailable = item.availableProviders?.some(
          (prov) =>
            prov.toLowerCase().includes(p.shortName.toLowerCase()) ||
            prov.toLowerCase().includes(p.name.toLowerCase())
        );
        if (matchPrimary || matchAvailable) {
          if (item.imdbRating && item.imdbRating > maxRating) {
            maxRating = item.imdbRating;
          }
        }
      }
      map.set(p.id, maxRating);
    }
    return map;
  }, [items]);

  // Filtered and sorted in-demand / popular items
  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      // 1. In-demand / popular criteria
      const isInDemand =
        item.popular ||
        item.criticallyAcclaimed ||
        item.featured ||
        (item.imdbRating && item.imdbRating >= 7.5) ||
        (item.communityRating && item.communityRating >= 85);

      if (!isInDemand && selectedPlatform === 'all') {
        // When looking at all, focus strictly on popular / in-demand
        return false;
      }

      // 2. Minimum IMDb rating filter
      if (minImdbRating > 0) {
        if (!item.imdbRating || item.imdbRating < minImdbRating) {
          return false;
        }
      }

      // 3. Platform match
      if (selectedPlatform !== 'all') {
        const platformCfg = POPULAR_PLATFORMS.find((p) => p.id === selectedPlatform);
        if (platformCfg) {
          const matchPrimary =
            item.streamingProvider?.toLowerCase().includes(platformCfg.shortName.toLowerCase()) ||
            item.streamingProvider?.toLowerCase().includes(platformCfg.name.toLowerCase());
          const matchAvailable = item.availableProviders?.some(
            (p) =>
              p.toLowerCase().includes(platformCfg.shortName.toLowerCase()) ||
              p.toLowerCase().includes(platformCfg.name.toLowerCase())
          );

          if (!matchPrimary && !matchAvailable) {
            return false;
          }
        }
      }

      // 4. Format / Type match (Movies vs Series)
      if (selectedType !== 'all') {
        if (item.type !== selectedType) {
          return false;
        }
      }

      // 5. Genre match
      if (selectedGenre !== 'All Genres') {
        const hasGenre = item.genres?.some(
          (g) => g.toLowerCase() === selectedGenre.toLowerCase()
        );
        if (!hasGenre) {
          return false;
        }
      }

      return true;
    });

    // Sort items
    return result.sort((a, b) => {
      if (sortBy === 'imdb') {
        return (b.imdbRating || 0) - (a.imdbRating || 0);
      }
      if (sortBy === 'popular') {
        return (b.communityRating || 0) - (a.communityRating || 0);
      }
      if (sortBy === 'newest') {
        return (b.releaseYear || 0) - (a.releaseYear || 0);
      }
      return 0;
    });
  }, [items, selectedPlatform, selectedType, selectedGenre, minImdbRating, sortBy]);

  const handleResetFilters = () => {
    setSelectedPlatform('all');
    setSelectedType('all');
    setSelectedGenre('All Genres');
    setMinImdbRating(0);
    setSortBy('imdb');
  };

  const activePlatformConfig = POPULAR_PLATFORMS.find((p) => p.id === selectedPlatform);

  return (
    <section
      id="streaming-platform-explorer"
      className="mb-14 bg-[#FAF9F6] dark:bg-[#18181B] border-2 border-[#141414] dark:border-[#27272A] p-5 sm:p-8 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-colors duration-200"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b-2 border-[#141414] dark:border-[#27272A] pb-4 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#78716C] dark:text-[#A1A1AA] mb-1">
            <Flame className="w-3.5 h-3.5 text-[#E50914]" />
            <span>TOP IMDb RATINGS & POPULAR TITLES</span>
          </div>
          <h2 className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5]">
            EXPLORE BY STREAMING PLATFORM
          </h2>
          <p className="font-serif-editorial text-sm text-[#57534E] dark:text-[#A1A1AA] mt-1 max-w-2xl">
            Filter by network, format, or highest IMDb rating. Discover world-class television sagas and cinematic masterpieces streaming seamlessly in HD.
          </p>
        </div>

        {/* Active Filters Summary Badge */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          {(selectedPlatform !== 'all' || selectedType !== 'all' || selectedGenre !== 'All Genres' || minImdbRating > 0) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-[#F4F1EA] dark:bg-[#27272A] hover:bg-[#141414] hover:text-[#FAF9F6] dark:hover:bg-[#F4F4F5] dark:hover:text-[#141414] border border-[#141414] dark:border-[#3F3F46] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_0px_rgba(20,20,20,1)]"
              title="Reset all filter selections"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>RESET FILTERS</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. STREAMING PLATFORMS SELECTOR */}
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] dark:text-[#A1A1AA] mb-2.5 flex items-center justify-between">
          <span>SELECT STREAMING NETWORK:</span>
          {activePlatformConfig && (
            <span className="text-[#141414] dark:text-[#F4F4F5] font-bold">
              FILTERED BY {activePlatformConfig.name.toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {/* ALL PLATFORMS BUTTON */}
          <button
            type="button"
            onClick={() => setSelectedPlatform('all')}
            className={`p-3 text-left border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[90px] relative group ${
              selectedPlatform === 'all'
                ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414] dark:border-[#F4F4F5] shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] -translate-y-0.5'
                : 'bg-[#F4F1EA] dark:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] border-[#141414]/30 dark:border-[#3F3F46] hover:border-[#141414] dark:hover:border-[#00A3FF] hover:bg-white dark:hover:bg-[#3F3F46]'
            }`}
          >
            {selectedPlatform === 'all' && (
              <div className="absolute top-2 right-2 text-[9px] font-mono flex items-center gap-0.5 bg-[#FAF9F6] dark:bg-[#141414] text-[#141414] dark:text-[#FAF9F6] px-1 py-0.5 font-bold">
                <Check className="w-2.5 h-2.5" />
                <span>ALL</span>
              </div>
            )}
            <div className="w-7 h-7 border border-current flex items-center justify-center font-mono font-bold text-xs">
              ★
            </div>
            <div>
              <div className="font-condensed font-bold text-sm sm:text-base uppercase tracking-wider">
                All Networks
              </div>
              <div className="text-[9px] font-mono text-[#78716C] dark:text-[#A1A1AA] group-hover:text-current mt-0.5 uppercase">
                Up to 9.5 ★ IMDb
              </div>
            </div>
          </button>

          {/* INDIVIDUAL PLATFORMS */}
          {POPULAR_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            const topRating = platformTopRatings.get(platform.id) || 0;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setSelectedPlatform(isSelected ? 'all' : platform.id)}
                className={`p-3 text-left border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[90px] relative group ${
                  isSelected
                    ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414] dark:border-[#F4F4F5] shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] -translate-y-0.5'
                    : 'bg-[#F4F1EA] dark:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] border-[#141414]/30 dark:border-[#3F3F46] hover:border-[#141414] dark:hover:border-[#00A3FF] hover:bg-white dark:hover:bg-[#3F3F46]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-[9px] font-mono flex items-center gap-0.5 bg-[#FAF9F6] dark:bg-[#141414] text-[#141414] dark:text-[#FAF9F6] px-1 py-0.5 font-bold">
                    <Check className="w-2.5 h-2.5" />
                    <span>ON</span>
                  </div>
                )}
                <div
                  className="w-7 h-7 rounded-none border border-current flex items-center justify-center font-condensed font-bold text-xs uppercase"
                  style={{
                    color: isSelected ? '#FAF9F6' : platform.brandColor,
                    borderColor: isSelected ? '#FAF9F6' : platform.borderColor,
                  }}
                >
                  {platform.badge}
                </div>
                <div>
                  <div className="font-condensed font-bold text-sm sm:text-base uppercase tracking-wider truncate">
                    {platform.shortName}
                  </div>
                  <div className="text-[9px] font-mono text-[#78716C] dark:text-[#A1A1AA] group-hover:text-current mt-0.5 uppercase truncate">
                    {topRating > 0 ? `★ ${topRating.toFixed(1)} IMDb` : 'Top IMDb'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. GENERAL FORMAT, IMDb RATINGS & SORTING */}
      <div className="bg-[#F4F1EA] dark:bg-[#202023] border border-[#141414]/25 dark:border-[#27272A] p-4 mb-8 space-y-3.5">
        {/* Top Filter Bar: Format & IMDb Rating Tiers */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#141414]/15 dark:border-[#27272A] pb-3">
          {/* Format Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 mr-1 text-[#141414] dark:text-[#F4F4F5]">
              <Film className="w-3.5 h-3.5" />
              <span className="font-condensed font-bold text-xs uppercase tracking-wider">
                FORMAT:
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                selectedType === 'all'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414]'
                  : 'bg-[#FAF9F6] dark:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] border-[#141414]/30 dark:border-[#3F3F46]'
              }`}
            >
              ALL FORMATS
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('movie')}
              className={`px-2.5 py-1 text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedType === 'movie'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414]'
                  : 'bg-[#FAF9F6] dark:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] border-[#141414]/30 dark:border-[#3F3F46]'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>MOVIES</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('tv')}
              className={`px-2.5 py-1 text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedType === 'tv'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414]'
                  : 'bg-[#FAF9F6] dark:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] border-[#141414]/30 dark:border-[#3F3F46]'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>SERIES</span>
            </button>
          </div>

          {/* Top IMDb Rating Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-condensed font-bold text-xs uppercase tracking-wider text-[#141414] dark:text-[#F4F4F5] flex items-center gap-1">
              <span>★ IMDb SCORE:</span>
            </span>
            {[
              { label: 'ALL IN-DEMAND', min: 0 },
              { label: '★ 8.0+ RATED', min: 8.0 },
              { label: '★ 8.5+ RATED', min: 8.5 },
              { label: '★ 9.0+ MASTERPIECES', min: 9.0 },
            ].map((tier) => (
              <button
                key={tier.min}
                type="button"
                onClick={() => setMinImdbRating(tier.min)}
                className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                  minImdbRating === tier.min
                    ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414] font-bold'
                    : 'bg-[#FAF9F6] dark:bg-[#27272A] text-[#57534E] dark:text-[#A1A1AA] border-[#141414]/20 dark:border-[#3F3F46] hover:border-[#141414] hover:text-[#141414] dark:hover:text-[#F4F4F5]'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="font-condensed font-bold text-xs uppercase tracking-wider text-[#141414] dark:text-[#F4F4F5]">
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF9F6] dark:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] border border-[#141414]/30 dark:border-[#3F3F46] font-mono text-xs px-2 py-1 outline-none cursor-pointer"
            >
              <option value="imdb">IMDb Rating (Highest)</option>
              <option value="popular">Popularity / Audience</option>
              <option value="newest">Release Year (Newest)</option>
            </select>
          </div>
        </div>

        {/* Genre Selector */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-[#141414] dark:text-[#F4F4F5]" />
            <span className="font-condensed font-bold text-xs uppercase tracking-wider text-[#141414] dark:text-[#F4F4F5]">
              GENRE:
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1">
            {AVAILABLE_GENRES.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414] font-bold'
                      : 'bg-[#FAF9F6] dark:bg-[#27272A] text-[#57534E] dark:text-[#A1A1AA] border-[#141414]/20 dark:border-[#3F3F46] hover:border-[#141414] hover:text-[#141414] dark:hover:text-[#F4F4F5]'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. FILTERED RESULTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#141414]/15 dark:border-[#27272A]">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-[#57534E] dark:text-[#A1A1AA]">
            <span>RESULTS:</span>
            <span className="font-bold text-[#141414] dark:text-[#F4F4F5] bg-[#F4F1EA] dark:bg-[#27272A] px-2 py-0.5 border border-[#141414]/30 dark:border-[#3F3F46]">
              {activePlatformConfig ? activePlatformConfig.name.toUpperCase() : 'ALL NETWORKS'}
            </span>
            <span>·</span>
            <span className="font-bold text-[#141414] dark:text-[#F4F4F5] bg-[#F4F1EA] dark:bg-[#27272A] px-2 py-0.5 border border-[#141414]/30 dark:border-[#3F3F46]">
              {selectedType === 'all' ? 'ALL FORMATS' : selectedType === 'movie' ? 'MOVIES' : 'SERIES'}
            </span>
            {minImdbRating > 0 && (
              <>
                <span>·</span>
                <span className="font-bold text-amber-500 bg-[#F4F1EA] dark:bg-[#27272A] px-2 py-0.5 border border-[#141414]/30 dark:border-[#3F3F46]">
                  IMDb {minImdbRating}+
                </span>
              </>
            )}
            <span>·</span>
            <span className="font-bold text-[#141414] dark:text-[#F4F4F5] bg-[#F4F1EA] dark:bg-[#27272A] px-2 py-0.5 border border-[#141414]/30 dark:border-[#3F3F46]">
              {selectedGenre.toUpperCase()}
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A1A1AA] hidden sm:block">
            SORTED BY {sortBy === 'imdb' ? 'TOP IMDb RATING' : sortBy === 'popular' ? 'POPULARITY' : 'RELEASE YEAR'}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-[#F4F1EA] dark:bg-[#202023] border border-dashed border-[#141414]/40 dark:border-[#3F3F46] p-8 sm:p-12 text-center my-4">
            <div className="w-12 h-12 border-2 border-[#141414] dark:border-[#3F3F46] flex items-center justify-center mx-auto mb-3 font-mono font-bold text-lg text-[#141414] dark:text-[#F4F4F5]">
              Ø
            </div>
            <h3 className="font-condensed text-xl font-bold uppercase tracking-wider text-[#141414] dark:text-[#F4F4F5] mb-1">
              NO TITLES MATCH CURRENT CRITERIA
            </h3>
            <p className="font-serif-editorial text-sm text-[#57534E] dark:text-[#A1A1AA] max-w-md mx-auto mb-4">
              We couldn't find titles matching the selected platform, format, minimum IMDb score, and genre.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2 bg-[#141414] text-[#FAF9F6] dark:bg-[#F4F4F5] dark:text-[#141414] hover:bg-[#00A3FF] hover:text-black text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
            >
              CLEAR FILTERS & SHOW ALL TOP TITLES
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <EditorialMovieCard
                key={item.id}
                item={item}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                watchlist={watchlist}
                onToggleWatchlist={onToggleWatchlist}
                onSelectActor={onSelectActor}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
