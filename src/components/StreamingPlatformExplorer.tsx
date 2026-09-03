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

  // Filtered in-demand / popular items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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

      // 2. Platform match
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

      // 3. Format / Type match (Movies vs Series)
      if (selectedType !== 'all') {
        if (item.type !== selectedType) {
          return false;
        }
      }

      // 4. Genre match
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
  }, [items, selectedPlatform, selectedType, selectedGenre]);

  const handleResetFilters = () => {
    setSelectedPlatform('all');
    setSelectedType('all');
    setSelectedGenre('All Genres');
  };

  const activePlatformConfig = POPULAR_PLATFORMS.find((p) => p.id === selectedPlatform);

  return (
    <section
      id="streaming-platform-explorer"
      className="mb-14 bg-[#FAF9F6] border-2 border-[#141414] p-5 sm:p-8 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b-2 border-[#141414] pb-4 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
            <Flame className="w-3.5 h-3.5 text-[#E50914]" />
            <span>POPULAR & IN-DEMAND TITLES</span>
          </div>
          <h2 className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414]">
            EXPLORE BY STREAMING PLATFORM
          </h2>
          <p className="font-serif-editorial text-sm text-[#57534E] mt-1 max-w-2xl">
            Select a platform to browse trending, audience-favorite movies and series. Every title is verified and streams directly in our high-definition player.
          </p>
        </div>

        {/* Active Filters Summary Badge */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          {(selectedPlatform !== 'all' || selectedType !== 'all' || selectedGenre !== 'All Genres') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 bg-[#F4F1EA] hover:bg-[#141414] hover:text-[#FAF9F6] border border-[#141414] text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_0px_rgba(20,20,20,1)]"
              title="Reset all filter selections"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>RESET FILTERS</span>
            </button>
          )}
          <span className="font-mono text-xs text-[#57534E] uppercase bg-[#F4F1EA] px-2.5 py-1.5 border border-[#141414]/20 font-bold">
            {filteredItems.length} {filteredItems.length === 1 ? 'TITLE' : 'TITLES'} FOUND
          </span>
        </div>
      </div>

      {/* 1. STREAMING PLATFORMS SELECTOR */}
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] mb-2.5 flex items-center justify-between">
          <span>SELECT STREAMING NETWORK:</span>
          {activePlatformConfig && (
            <span className="text-[#141414] font-bold">
              FILTERED BY {activePlatformConfig.name.toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {/* ALL PLATFORMS BUTTON */}
          <button
            type="button"
            onClick={() => setSelectedPlatform('all')}
            className={`p-3 text-left border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[90px] relative group ${
              selectedPlatform === 'all'
                ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] -translate-y-0.5'
                : 'bg-[#F4F1EA] text-[#141414] border-[#141414]/30 hover:border-[#141414] hover:bg-white'
            }`}
          >
            {selectedPlatform === 'all' && (
              <div className="absolute top-2 right-2 text-[9px] font-mono flex items-center gap-0.5 bg-[#FAF9F6] text-[#141414] px-1 py-0.5 font-bold">
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
              <div className="text-[9px] font-mono text-[#78716C] group-hover:text-current mt-0.5 uppercase">
                All Popular Prints
              </div>
            </div>
          </button>

          {/* INDIVIDUAL PLATFORMS */}
          {POPULAR_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <button
                key={platform.id}
                type="button"
                onClick={() => setSelectedPlatform(isSelected ? 'all' : platform.id)}
                className={`p-3 text-left border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[90px] relative group ${
                  isSelected
                    ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] -translate-y-0.5'
                    : 'bg-[#F4F1EA] text-[#141414] border-[#141414]/30 hover:border-[#141414] hover:bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-[9px] font-mono flex items-center gap-0.5 bg-[#FAF9F6] text-[#141414] px-1 py-0.5 font-bold">
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
                  <div className="text-[9px] font-mono text-[#78716C] group-hover:text-current mt-0.5 uppercase truncate">
                    Popular In-Demand
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. GENERAL FORMAT FILTER (MOVIES OR SERIES) & GENRE FILTER */}
      <div className="bg-[#F4F1EA] border border-[#141414]/25 p-4 mb-8 space-y-4">
        {/* Format Selector: All vs Movies vs Series */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#141414]/15 pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#141414]" />
            <span className="font-condensed font-bold text-xs uppercase tracking-wider text-[#141414]">
              FORMAT FILTER:
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                selectedType === 'all'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414]'
                  : 'bg-[#FAF9F6] text-[#141414] border-[#141414]/30 hover:border-[#141414]'
              }`}
            >
              ALL FORMATS
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('movie')}
              className={`px-3 py-1 text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedType === 'movie'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414]'
                  : 'bg-[#FAF9F6] text-[#141414] border-[#141414]/30 hover:border-[#141414]'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>MOVIES (FEATURE FILMS)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('tv')}
              className={`px-3 py-1 text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-1 ${
                selectedType === 'tv'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414]'
                  : 'bg-[#FAF9F6] text-[#141414] border-[#141414]/30 hover:border-[#141414]'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>SERIES (TV SHOWS)</span>
            </button>
          </div>
        </div>

        {/* Genre Selector */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
          <div className="flex items-center gap-2 shrink-0 pt-1">
            <Sparkles className="w-4 h-4 text-[#141414]" />
            <span className="font-condensed font-bold text-xs uppercase tracking-wider text-[#141414]">
              SELECTION OF GENRE:
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
                      ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold'
                      : 'bg-[#FAF9F6] text-[#57534E] border-[#141414]/20 hover:border-[#141414] hover:text-[#141414]'
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
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#141414]/15">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-[#57534E]">
            <span>FILTERED RESULTS:</span>
            <span className="font-bold text-[#141414] bg-[#F4F1EA] px-2 py-0.5 border border-[#141414]/30">
              {activePlatformConfig ? activePlatformConfig.name.toUpperCase() : 'ALL NETWORKS'}
            </span>
            <span>·</span>
            <span className="font-bold text-[#141414] bg-[#F4F1EA] px-2 py-0.5 border border-[#141414]/30">
              {selectedType === 'all' ? 'ALL FORMATS' : selectedType === 'movie' ? 'MOVIES' : 'SERIES'}
            </span>
            <span>·</span>
            <span className="font-bold text-[#141414] bg-[#F4F1EA] px-2 py-0.5 border border-[#141414]/30">
              {selectedGenre.toUpperCase()}
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#78716C] hidden sm:block">
            HD STREAM PLAYBACK
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-[#F4F1EA] border border-dashed border-[#141414]/40 p-8 sm:p-12 text-center my-4">
            <div className="w-12 h-12 border-2 border-[#141414] flex items-center justify-center mx-auto mb-3 font-mono font-bold text-lg">
              Ø
            </div>
            <h3 className="font-condensed text-xl font-bold uppercase tracking-wider text-[#141414] mb-1">
              NO TITLES MATCH CURRENT COMBINATION
            </h3>
            <p className="font-serif-editorial text-sm text-[#57534E] max-w-md mx-auto mb-4">
              We couldn't locate popular or in-demand titles matching the selected platform, format, and genre simultaneously.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-5 py-2 bg-[#141414] text-[#FAF9F6] hover:bg-[#00A3FF] hover:text-black text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
            >
              CLEAR FILTERS & SHOW ALL POPULAR TITLES
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
