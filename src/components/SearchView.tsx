import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { searchImdbTitles } from '../services/imdbService';
import { Search, X, Loader2, Film, Tv, CheckCircle } from 'lucide-react';

interface SearchViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  initialQuery?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({
  items,
  onPlay,
  onOpenDetails,
  onSelectActor,
  watchlist,
  onToggleWatchlist,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef<any>(null);

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

  return (
    <div id="editorial-search-view" className="py-8">
      {/* Archival Search Header */}
      <div className="max-w-3xl mb-8">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
          IMDb SYNCHRONIZED SEARCH · REAL-TIME REGISTRY
        </div>
        <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414]">
          SEARCH MOVIES & SERIES
        </h1>
        <p className="font-serif-editorial text-[#57534E] text-sm mt-1">
          Direct query across the global IMDb registry for motion pictures, television serials, and streaming productions.
        </p>

        {/* Minimalist Search Input */}
        <div className="relative mt-6">
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
      </div>

      {/* Results Header */}
      <div className="border-b-2 border-[#141414] pb-2 mb-8 flex items-baseline justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider text-[#141414]">
            {query.trim() ? (
              <>
                IMDb RESULTS FOR <span className="underline">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              'CATALOGUE ARCHIVE'
            )}
          </h2>
          {isSearching && (
            <span className="text-xs font-mono text-[#78716C] animate-pulse">
              SYNCING REGISTRY...
            </span>
          )}
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-[#57534E]">
          {searchResults.length} {searchResults.length === 1 ? 'PRINT DETECTED' : 'PRINTS DETECTED'}
        </span>
      </div>

      {/* Results Grid (Section 38 format: Poster, Title, Year, Type, Rating, Provider availability) */}
      {searchResults.length === 0 && !isSearching ? (
        <div className="border border-[#141414]/30 bg-[#F4F1EA] p-12 text-center my-8">
          <div className="font-condensed text-2xl font-bold uppercase text-[#141414] mb-2">
            NO ARCHIVAL MATCHES DETECTED
          </div>
          <p className="font-serif-editorial text-sm text-[#57534E] max-w-md mx-auto mb-4">
            No IMDb registered titles matched &ldquo;{query}&rdquo;. Check spelling or try popular titles like &ldquo;Spider-Man&rdquo;, &ldquo;The Last of Us&rdquo;, or &ldquo;Breaking Bad&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="px-4 py-2 bg-[#141414] text-[#FAF9F6] text-xs font-condensed uppercase tracking-widest hover:bg-[#2B2A27] cursor-pointer"
          >
            VIEW ALL CATALOGUE PRINTS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {searchResults.map((item) => (
            <div key={item.id} className="flex flex-col">
              <EditorialMovieCard
                item={item}
                onPlay={onPlay}
                onOpenDetails={onOpenDetails}
                onSelectActor={onSelectActor}
                watchlist={watchlist}
                onToggleWatchlist={onToggleWatchlist}
              />
              {/* Card Metadata Footer per Section 38: Available sources */}
              <div className="mt-1 pt-1 border-t border-[#141414]/10 text-[10px] font-mono text-[#57534E] flex items-center justify-between">
                <span>Sources:</span>
                <span className="text-[#0284C7] font-semibold flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  IMDbWatch
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
