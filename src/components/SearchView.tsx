import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MediaItem } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { searchImdbTitles } from '../services/imdbService';
import {
  DEFAULT_COUNTRY_CODE,
  SUPPORTED_COUNTRIES,
} from '../services/streamingAvailabilityService';
import { Search, X, Loader2, Filter } from 'lucide-react';

interface SearchViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  initialQuery?: string;
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
}

const TYPE_FILTER_OPTIONS: { id: 'ALL' | 'movie' | 'tv'; label: string }[] = [
  { id: 'ALL', label: 'ALL TITLES' },
  { id: 'movie', label: 'FEATURE FILMS' },
  { id: 'tv', label: 'TV SERIES' },
];

export const SearchView: React.FC<SearchViewProps> = ({
  items,
  onPlay,
  onOpenDetails,
  onSelectActor,
  watchlist,
  onToggleWatchlist,
  initialQuery = '',
  selectedCountry: propCountry = DEFAULT_COUNTRY_CODE,
  onSelectCountry: propOnSelectCountry,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [countryCode, setCountryCode] = useState(propCountry);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'movie' | 'tv'>('ALL');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef<any>(null);

  const handleCountryChange = (c: string) => {
    setCountryCode(c);
    propOnSelectCountry?.(c);
    try {
      localStorage.setItem('suburbia_country', c);
    } catch {}
  };

  const curatedQueries = [
    'Spider-Man',
    'The Last of Us',
    'Breaking Bad',
    'Oppenheimer',
    'Dune',
    'Succession',
    'Severance',
    'Stranger Things',
  ];

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults(items);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const liveResults = await searchImdbTitles(trimmed);
        if (liveResults && liveResults.length > 0) {
          setSearchResults(liveResults);
        } else {
          // Fallback to searching available catalog if live query returned 0
          const q = trimmed.toLowerCase();
          const localFiltered = items.filter((item) => {
            return (
              item.title.toLowerCase().includes(q) ||
              item.imdbId.toLowerCase().includes(q) ||
              (item.director || '').toLowerCase().includes(q) ||
              item.genres.some((g) => g.toLowerCase().includes(q))
            );
          });
          setSearchResults(localFiltered);
        }
      } catch (err) {
        console.error('IMDb search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [query, items]);

  // Filter by category (all, movie, tv)
  const filteredResults = useMemo(() => {
    if (selectedTypeFilter === 'ALL') {
      return searchResults;
    }
    return searchResults.filter((item) => item.type === selectedTypeFilter);
  }, [searchResults, selectedTypeFilter]);

  const currentCountry =
    SUPPORTED_COUNTRIES.find((c) => c.code.toUpperCase() === countryCode.toUpperCase()) ||
    SUPPORTED_COUNTRIES[0];

  return (
    <div id="editorial-search-view" className="py-8">
      {/* Archival Search Header */}
      <div className="max-w-4xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
            IMDb SYNCHRONIZED SEARCH · STREAM EXCLUSIVELY VIA PLAYER.IMDB.SU
          </div>
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-[#141414] text-[#FAF9F6] font-bold self-start sm:self-auto">
            DIRECT PLAYER
          </span>
        </div>

        <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414]">
          SEARCH MOVIES & SERIES
        </h1>
        <p className="font-serif-editorial text-[#57534E] text-sm mt-1">
          Direct query across the global IMDb registry. Every title streams in full 1080p HD on{' '}
          <strong className="text-[#141414]">streamimdb.ru</strong> with zero subscriptions or digital store rentals.
        </p>

        {/* Minimalist Search Input */}
        <div className="relative mt-5">
          <div className="flex items-center border-2 border-[#141414] bg-[#F4F1EA] px-4 py-3 shadow-inner">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-[#141414] shrink-0 mr-3 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-[#141414] shrink-0 mr-3" />
            )}
            <input
              id="imdb-live-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH IMDb (E.G. SPIDER-MAN, THE LAST OF US, BREAKING BAD)..."
              className="w-full bg-transparent font-condensed text-xl sm:text-2xl uppercase tracking-wide text-[#141414] placeholder:text-[#857F77] focus:outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 hover:bg-[#141414]/10 cursor-pointer text-[#141414]"
                aria-label="Clear query"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Curated Suggested Index Buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#78716C] mr-1">
            VERIFIED QUERIES:
          </span>
          {curatedQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="font-mono text-[11px] uppercase bg-[#F4F1EA] border border-[#141414]/20 px-2.5 py-1 hover:border-[#141414] hover:bg-[#141414] hover:text-[#FAF9F6] transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>

        {/* FORMAT FILTER */}
        <div className="mt-5 p-3.5 bg-[#F4F1EA] border border-[#141414]/25">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-3.5 h-3.5 text-[#141414]" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#141414]">
              FILTER ARCHIVE CATEGORY:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTER_OPTIONS.map((opt) => {
              const isSelected = selectedTypeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`filter-type-${opt.id.toLowerCase()}`}
                  onClick={() => setSelectedTypeFilter(opt.id)}
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#141414] text-[#FAF9F6] font-bold border-[#141414] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]'
                      : 'bg-[#FAF9F6] text-[#141414] border-[#141414]/40 hover:border-[#141414] hover:bg-[#E8E5DC]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="border-b-2 border-[#141414] pb-2 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider text-[#141414]">
            {query.trim() ? (
              <>
                IMDb RESULTS FOR <span className="underline">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              'CATALOGUE ARCHIVE'
            )}
            {selectedTypeFilter !== 'ALL' && (
              <span className="text-[#0284C7] ml-2">[{selectedTypeFilter === 'movie' ? 'FILMS' : 'SERIES'}]</span>
            )}
          </h2>
          {isSearching && (
            <span className="text-xs font-mono text-[#78716C] animate-pulse">
              SYNCING REGISTRY...
            </span>
          )}
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-[#57534E]">
          {filteredResults.length} {filteredResults.length === 1 ? 'PRINT DETECTED' : 'PRINTS DETECTED'}
        </span>
      </div>

      {/* Results Grid */}
      {filteredResults.length === 0 && !isSearching ? (
        <div className="border border-[#141414]/30 bg-[#F4F1EA] p-12 text-center my-8">
          <div className="font-condensed text-2xl font-bold uppercase text-[#141414] mb-2">
            NO MATCHING ARCHIVAL PRINTS
          </div>
          <p className="font-serif-editorial text-sm text-[#57534E] max-w-md mx-auto mb-4">
            {selectedTypeFilter !== 'ALL'
              ? `No ${selectedTypeFilter === 'movie' ? 'films' : 'series'} matched the search. Try selecting 'ALL TITLES'.`
              : `No IMDb registered titles matched “${query}”. Check spelling or try popular titles like “Spider-Man”, “The Last of Us”, or “Breaking Bad”.`}
          </p>
          <div className="flex justify-center gap-2">
            {selectedTypeFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedTypeFilter('ALL')}
                className="px-4 py-2 bg-[#141414] text-[#FAF9F6] text-xs font-condensed uppercase tracking-widest hover:bg-[#2B2A27] cursor-pointer"
              >
                RESET CATEGORY FILTER
              </button>
            )}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-4 py-2 border border-[#141414] text-[#141414] text-xs font-condensed uppercase tracking-widest hover:bg-[#141414]/10 cursor-pointer"
              >
                VIEW ALL CATALOGUE PRINTS
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredResults.map((item) => (
            <div key={item.id} className="flex flex-col">
              <EditorialMovieCard
                item={item}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                onSelectActor={onSelectActor}
                watchlist={watchlist}
                onToggleWatchlist={onToggleWatchlist}
              />
              {/* Direct streaming badge */}
              <div className="mt-1 pt-1 border-t border-[#141414]/15 text-[10px] font-mono text-[#57534E] flex items-center justify-between">
                <span className="truncate">
                  STREAM: <span className="font-bold text-[#141414]">PLAYER.IMDB.SU</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 ml-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

