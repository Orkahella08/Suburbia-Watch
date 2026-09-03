import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MediaItem, Season, Episode } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { searchImdbTitles, fetchTvSeasonsAndEpisodes } from '../services/imdbService';
import { extractImdbId } from '../utils/imdb';
import {
  DEFAULT_COUNTRY_CODE,
  SUPPORTED_COUNTRIES,
} from '../services/streamingAvailabilityService';
import {
  Search,
  X,
  Loader2,
  Filter,
  Tv,
  Film,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SearchViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem, seasonNumber?: number, episodeId?: string) => void;
  onOpenDetails: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  initialQuery?: string;
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
}

type FilterType = 'ALL' | 'movie' | 'tv' | 'episodes';

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
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<FilterType>('ALL');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef<any>(null);

  // Dynamic episodes cache for fetched TV series
  const [dynamicSeasonsCache, setDynamicSeasonsCache] = useState<Record<string, Season[]>>({});
  // Expanded series episode drawer (id of series currently opened)
  const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [loadingEpisodesForId, setLoadingEpisodesForId] = useState<string | null>(null);

  const curatedQueries = [
    'Stranger Things',
    'The Last of Us',
    'Breaking Bad',
    'Severance',
    'Game of Thrones',
    'Attack on Titan',
    'Spider-Man',
    'Oppenheimer',
    'Dune',
  ];

  // Helper to reconcile IMDb results with our local rich catalog (with seasons/episodes)
  const enrichWithCatalog = (list: MediaItem[]): MediaItem[] => {
    return list.map((item) => {
      const match = items.find(
        (local) =>
          local.id === item.id ||
          (local.imdbId && item.imdbId && local.imdbId.toLowerCase() === item.imdbId.toLowerCase()) ||
          local.title.toLowerCase() === item.title.toLowerCase()
      );
      if (match) {
        return {
          ...item,
          seasons: match.seasons || item.seasons,
          seasonsCount: match.seasonsCount || item.seasonsCount,
          backdropUrl: item.backdropUrl || match.backdropUrl,
          posterUrl: item.posterUrl || match.posterUrl,
          synopsis: item.synopsis || match.synopsis,
          genres: item.genres.length > 0 ? item.genres : match.genres,
        };
      }
      return item;
    });
  };

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
          const enriched = enrichWithCatalog(liveResults);
          setSearchResults(enriched);
        } else {
          // Fallback to searching available catalog if live query returned 0
          const q = trimmed.toLowerCase();
          const localFiltered = items.filter((item) => {
            const hasEpMatch =
              item.seasons?.some((s) =>
                s.episodes.some(
                  (ep) =>
                    ep.title.toLowerCase().includes(q) ||
                    (ep.synopsis && ep.synopsis.toLowerCase().includes(q))
                )
              );

            return (
              item.title.toLowerCase().includes(q) ||
              item.imdbId.toLowerCase().includes(q) ||
              (item.director || '').toLowerCase().includes(q) ||
              item.genres.some((g) => g.toLowerCase().includes(q)) ||
              hasEpMatch
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

  // Extract all matching episodes across all series in the catalog
  const matchedEpisodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: {
      series: MediaItem;
      seasonNumber: number;
      episode: Episode;
    }[] = [];

    // Search through all items in searchResults and items
    const candidateSeries = [
      ...searchResults.filter((i) => i.type === 'tv'),
      ...items.filter((i) => i.type === 'tv'),
    ];

    const seenEpIds = new Set<string>();

    for (const s of candidateSeries) {
      const activeSeasons = s.seasons || dynamicSeasonsCache[s.id] || [];
      if (!activeSeasons || activeSeasons.length === 0) continue;

      const seriesTitleMatches = q ? s.title.toLowerCase().includes(q) : false;

      for (const season of activeSeasons) {
        for (const ep of season.episodes) {
          if (seenEpIds.has(ep.id)) continue;

          if (!q) {
            // If no query, show sample first episodes of popular series
            if (ep.episodeNumber <= 2) {
              seenEpIds.add(ep.id);
              list.push({
                series: s,
                seasonNumber: season.seasonNumber,
                episode: ep,
              });
            }
          } else {
            const epMatches =
              seriesTitleMatches ||
              ep.title.toLowerCase().includes(q) ||
              (ep.synopsis && ep.synopsis.toLowerCase().includes(q)) ||
              `s${season.seasonNumber}e${ep.episodeNumber}`.includes(q) ||
              `season ${season.seasonNumber}`.includes(q) ||
              `episode ${ep.episodeNumber}`.includes(q);

            if (epMatches) {
              seenEpIds.add(ep.id);
              list.push({
                series: s,
                seasonNumber: season.seasonNumber,
                episode: ep,
              });
            }
          }
        }
      }
    }

    return list;
  }, [query, searchResults, items, dynamicSeasonsCache]);

  // Filter by category (all, movie, tv, episodes)
  const filteredResults = useMemo(() => {
    if (selectedTypeFilter === 'ALL') {
      return searchResults;
    }
    if (selectedTypeFilter === 'movie' || selectedTypeFilter === 'tv') {
      return searchResults.filter((item) => item.type === selectedTypeFilter);
    }
    return [];
  }, [searchResults, selectedTypeFilter]);

  // Load episodes dynamically if not present when expanding a TV series
  const handleToggleExpandSeries = async (series: MediaItem) => {
    if (expandedSeriesId === series.id) {
      setExpandedSeriesId(null);
      return;
    }

    setExpandedSeriesId(series.id);
    setSelectedSeasonNumber(1);

    // If series already has seasons, no need to fetch
    if (series.seasons && series.seasons.length > 0) {
      return;
    }

    if (dynamicSeasonsCache[series.id]) {
      return;
    }

    // Fetch from TVMaze / IMDb fallback
    setLoadingEpisodesForId(series.id);
    try {
      const cleanId = extractImdbId(series.imdbId);
      const fetched = await fetchTvSeasonsAndEpisodes(cleanId, series.title);
      if (fetched && fetched.length > 0) {
        setDynamicSeasonsCache((prev) => ({
          ...prev,
          [series.id]: fetched,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch seasons for series:', series.title, err);
    } finally {
      setLoadingEpisodesForId(null);
    }
  };

  const currentExpandedSeries = useMemo(() => {
    if (!expandedSeriesId) return null;
    return (
      searchResults.find((i) => i.id === expandedSeriesId) ||
      items.find((i) => i.id === expandedSeriesId) ||
      null
    );
  }, [expandedSeriesId, searchResults, items]);

  const currentExpandedSeasons = useMemo(() => {
    if (!currentExpandedSeries) return [];
    return (
      currentExpandedSeries.seasons ||
      dynamicSeasonsCache[currentExpandedSeries.id] ||
      []
    );
  }, [currentExpandedSeries, dynamicSeasonsCache]);

  const currentExpandedSeason = useMemo(() => {
    if (currentExpandedSeasons.length === 0) return null;
    return (
      currentExpandedSeasons.find((s) => s.seasonNumber === selectedSeasonNumber) ||
      currentExpandedSeasons[0]
    );
  }, [currentExpandedSeasons, selectedSeasonNumber]);

  return (
    <div id="editorial-search-view" className="py-8">
      {/* Archival Search Header */}
      <div className="max-w-4xl mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] dark:text-[#A1A1AA]">
            IMDb SYNCHRONIZED SEARCH · ALL SEASONS & EPISODES CATALOGED
          </div>
          <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-[#141414] text-[#FAF9F6] dark:bg-[#F4F4F5] dark:text-[#141414] font-bold self-start sm:self-auto">
            ALL SEASONS READY
          </span>
        </div>

        <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414] dark:text-[#F4F4F5]">
          SEARCH MOVIES & SERIES
        </h1>
        <p className="font-serif-editorial text-[#57534E] dark:text-[#A1A1AA] text-sm mt-1">
          Direct query across the global IMDb registry. Every series provides access to <strong className="text-[#141414] dark:text-[#F4F4F5]">all available seasons and episodes</strong> with full episodic navigation and instant 1080p playback.
        </p>

        {/* Search Input */}
        <div className="relative mt-5">
          <div className="flex items-center border-2 border-[#141414] dark:border-[#27272A] bg-[#F4F1EA] dark:bg-[#18181B] px-4 py-3 shadow-inner">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-[#141414] dark:text-[#F4F4F5] shrink-0 mr-3 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-[#141414] dark:text-[#F4F4F5] shrink-0 mr-3" />
            )}
            <input
              id="imdb-live-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH TITLES OR EPISODES (E.G. STRANGER THINGS, DEAR BILLY, BREAKING BAD, OZYMANDIAS)..."
              className="w-full bg-transparent font-condensed text-xl sm:text-2xl uppercase tracking-wide text-[#141414] dark:text-[#F4F4F5] placeholder:text-[#857F77] dark:placeholder:text-[#71717A] focus:outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 hover:bg-[#141414]/10 dark:hover:bg-white/10 cursor-pointer text-[#141414] dark:text-[#F4F4F5]"
                aria-label="Clear query"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Curated Suggested Index Buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#78716C] dark:text-[#A1A1AA] mr-1">
            VERIFIED QUERIES:
          </span>
          {curatedQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="font-mono text-[11px] uppercase bg-[#F4F1EA] dark:bg-[#18181B] border border-[#141414]/20 dark:border-[#27272A] text-[#141414] dark:text-[#F4F4F5] px-2.5 py-1 hover:border-[#141414] dark:hover:border-[#00A3FF] hover:bg-[#141414] hover:text-[#FAF9F6] dark:hover:bg-[#00A3FF] dark:hover:text-black transition-colors cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>

        {/* FORMAT & EPISODE FILTER BAR */}
        <div className="mt-5 p-3.5 bg-[#F4F1EA] dark:bg-[#18181B] border border-[#141414]/25 dark:border-[#27272A]">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-3.5 h-3.5 text-[#141414] dark:text-[#F4F4F5]" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#141414] dark:text-[#F4F4F5]">
              CATEGORY & EPISODE FILTER:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'ALL', label: 'ALL PRINTS' },
              { id: 'movie', label: 'FEATURE FILMS' },
              { id: 'tv', label: 'TV SERIES' },
              {
                id: 'episodes',
                label: `ALL EPISODES (${matchedEpisodes.length})`,
              },
            ].map((opt) => {
              const isSelected = selectedTypeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`filter-type-${opt.id.toLowerCase()}`}
                  onClick={() => setSelectedTypeFilter(opt.id as FilterType)}
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#141414] text-[#FAF9F6] dark:bg-[#F4F4F5] dark:text-[#141414] font-bold border-[#141414] dark:border-[#F4F4F5] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,163,255,1)]'
                      : 'bg-[#FAF9F6] dark:bg-[#27272A] text-[#141414] dark:text-[#F4F4F5] border-[#141414]/40 dark:border-[#3F3F46] hover:border-[#141414] hover:bg-[#E8E5DC] dark:hover:bg-[#3F3F46]'
                  }`}
                >
                  {opt.id === 'episodes' && <Tv className="w-3.5 h-3.5 text-[#00A3FF]" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* EXPANDED SERIES EPISODE VIEWER MODAL / IN-LINE DRAWER */}
      {currentExpandedSeries && (
        <div
          id="series-episode-browser-drawer"
          className="mb-8 border-2 border-[#141414] dark:border-[#00A3FF] bg-[#FAF9F6] dark:bg-[#141416] p-5 sm:p-7 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,163,255,0.4)] transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#141414] dark:border-[#27272A] pb-4 mb-4 gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#00A3FF] font-bold mb-0.5">
                FULL EPISODIC ARCHIVE · ALL SEASONS
              </div>
              <h3 className="font-condensed text-2xl sm:text-3xl font-bold uppercase text-[#141414] dark:text-[#F4F4F5]">
                {currentExpandedSeries.title}
              </h3>
              <p className="font-serif-editorial text-xs text-[#57534E] dark:text-[#A1A1AA] mt-1 max-w-2xl">
                {currentExpandedSeries.synopsis}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onPlay(currentExpandedSeries, selectedSeasonNumber)}
                className="px-3 py-1.5 bg-[#141414] text-[#FAF9F6] dark:bg-[#00A3FF] dark:text-black font-condensed font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>PLAY FROM START</span>
              </button>
              <button
                type="button"
                onClick={() => setExpandedSeriesId(null)}
                className="p-1.5 border border-[#141414] dark:border-[#27272A] text-[#141414] dark:text-[#F4F4F5] hover:bg-[#141414]/10 dark:hover:bg-white/10 cursor-pointer"
                title="Close episode browser"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loadingEpisodesForId === currentExpandedSeries.id ? (
            <div className="py-12 text-center font-mono text-xs text-[#78716C] dark:text-[#A1A1AA] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#00A3FF]" />
              <span>Retrieving verified episodes from IMDb repository...</span>
            </div>
          ) : currentExpandedSeasons.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-[#78716C] dark:text-[#A1A1AA]">
              No individual episodes cataloged yet. You can launch direct streaming immediately using the main player.
            </div>
          ) : (
            <div>
              {/* Season Selection Tabs */}
              <div className="flex items-center gap-2 flex-wrap mb-4 pb-2 border-b border-[#141414]/15 dark:border-[#27272A]">
                <span className="font-mono text-xs uppercase font-bold text-[#141414] dark:text-[#F4F4F5] mr-1">
                  SELECT SEASON:
                </span>
                {currentExpandedSeasons.map((s) => {
                  const isSelected = selectedSeasonNumber === s.seasonNumber;
                  return (
                    <button
                      key={s.seasonNumber}
                      type="button"
                      onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                      className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#141414] text-[#FAF9F6] dark:bg-[#00A3FF] dark:text-black font-bold border-[#141414] dark:border-[#00A3FF]'
                          : 'bg-[#F4F1EA] dark:bg-[#1F1F24] text-[#141414] dark:text-[#A1A1AA] border-[#141414]/30 dark:border-[#27272A] hover:border-[#141414]'
                      }`}
                    >
                      <span>Season {s.seasonNumber}</span>
                      <span className="text-[10px] opacity-75">
                        ({s.episodes.length} eps)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Episode Grid for Selected Season */}
              {currentExpandedSeason && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentExpandedSeason.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="border border-[#141414]/30 dark:border-[#27272A] bg-[#F4F1EA] dark:bg-[#18181B] p-3 flex flex-col justify-between hover:border-[#141414] dark:hover:border-[#00A3FF] transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#78716C] dark:text-[#A1A1AA] mb-1">
                          <span className="font-bold text-[#141414] dark:text-[#00A3FF]">
                            S{currentExpandedSeason.seasonNumber.toString().padStart(2, '0')} · E{ep.episodeNumber.toString().padStart(2, '0')}
                          </span>
                          <span>{ep.duration || '45m'}</span>
                        </div>
                        <h4 className="font-condensed font-bold text-base uppercase text-[#141414] dark:text-[#FAF9F6] line-clamp-1 group-hover:text-[#00A3FF] transition-colors">
                          {ep.title}
                        </h4>
                        <p className="font-serif-editorial text-xs text-[#57534E] dark:text-[#A1A1AA] line-clamp-2 mt-1">
                          {ep.synopsis || `Episode ${ep.episodeNumber} of Season ${currentExpandedSeason.seasonNumber}.`}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#141414]/15 dark:border-[#27272A] flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#78716C] dark:text-[#A1A1AA]">
                          {ep.releaseDate ? ep.releaseDate : 'IMDb HD Stream'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onPlay(currentExpandedSeries, currentExpandedSeason.seasonNumber, ep.id)}
                          className="px-2.5 py-1 bg-[#141414] text-[#FAF9F6] dark:bg-[#00A3FF] dark:text-black hover:bg-[#2B2A27] dark:hover:bg-[#38BDF8] font-condensed font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>PLAY EPISODE</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="border-b-2 border-[#141414] dark:border-[#27272A] pb-2 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="flex items-center gap-3">
          <h2 className="font-condensed text-2xl font-bold uppercase tracking-wider text-[#141414] dark:text-[#F4F4F5]">
            {query.trim() ? (
              <>
                IMDb RESULTS FOR <span className="underline">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              'CATALOGUE ARCHIVE'
            )}
            {selectedTypeFilter !== 'ALL' && (
              <span className="text-[#0284C7] dark:text-[#38BDF8] ml-2">
                [{selectedTypeFilter === 'movie' ? 'FILMS' : selectedTypeFilter === 'tv' ? 'SERIES' : 'EPISODES'}]
              </span>
            )}
          </h2>
          {isSearching && (
            <span className="text-xs font-mono text-[#78716C] dark:text-[#A1A1AA] animate-pulse">
              SYNCING REGISTRY...
            </span>
          )}
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A1A1AA]">
          {selectedTypeFilter === 'episodes'
            ? `${matchedEpisodes.length} EPISODES DETECTED`
            : `${filteredResults.length} ${filteredResults.length === 1 ? 'PRINT DETECTED' : 'PRINTS DETECTED'}`}
        </span>
      </div>

      {/* VIEW 1: EPISODE-FOCUSED SEARCH VIEW */}
      {selectedTypeFilter === 'episodes' ? (
        matchedEpisodes.length === 0 ? (
          <div className="border border-[#141414]/30 dark:border-[#27272A] bg-[#F4F1EA] dark:bg-[#18181B] p-12 text-center my-8">
            <div className="font-condensed text-2xl font-bold uppercase text-[#141414] dark:text-[#F4F4F5] mb-2">
              NO EPISODES MATCHED “{query}”
            </div>
            <p className="font-serif-editorial text-sm text-[#57534E] dark:text-[#A1A1AA] max-w-md mx-auto mb-4">
              Try searching by episode name like “Dear Billy”, “Vecna”, “Ozymandias”, or the series title “Stranger Things”.
            </p>
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('ALL')}
              className="px-4 py-2 bg-[#141414] text-[#FAF9F6] dark:bg-[#00A3FF] dark:text-black text-xs font-condensed uppercase tracking-widest cursor-pointer"
            >
              VIEW ALL TITLES
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedEpisodes.map(({ series, seasonNumber, episode }) => (
              <div
                key={`${series.id}-${seasonNumber}-${episode.id}`}
                className="border-2 border-[#141414] dark:border-[#27272A] bg-[#F4F1EA] dark:bg-[#18181B] p-4 flex flex-col justify-between hover:border-[#141414] dark:hover:border-[#00A3FF] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] dark:shadow-[2px_2px_0px_0px_rgba(0,163,255,0.4)] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#78716C] dark:text-[#A1A1AA] mb-1.5">
                    <span className="font-bold text-[#00A3FF] uppercase tracking-wider">
                      {series.title} · S{seasonNumber.toString().padStart(2, '0')}E{episode.episodeNumber.toString().padStart(2, '0')}
                    </span>
                    <span>{episode.duration || '45m'}</span>
                  </div>

                  <h3 className="font-condensed font-bold text-lg uppercase text-[#141414] dark:text-[#FAF9F6] group-hover:text-[#00A3FF] transition-colors">
                    {episode.title}
                  </h3>

                  <p className="font-serif-editorial text-xs text-[#57534E] dark:text-[#A1A1AA] line-clamp-3 mt-1.5">
                    {episode.synopsis || `Episode ${episode.episodeNumber} of ${series.title} Season ${seasonNumber}.`}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#141414]/15 dark:border-[#27272A] flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#78716C] dark:text-[#A1A1AA] truncate">
                    AIR DATE: {episode.releaseDate || 'Cataloged'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onPlay(series, seasonNumber, episode.id)}
                    className="px-3 py-1.5 bg-[#141414] text-[#FAF9F6] dark:bg-[#00A3FF] dark:text-black hover:bg-[#2B2A27] dark:hover:bg-[#38BDF8] font-condensed font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>PLAY EPISODE</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* VIEW 2: STANDARD MOVIES & TV SERIES CARDS */
        filteredResults.length === 0 && !isSearching ? (
          <div className="border border-[#141414]/30 dark:border-[#27272A] bg-[#F4F1EA] dark:bg-[#18181B] p-12 text-center my-8">
            <div className="font-condensed text-2xl font-bold uppercase text-[#141414] dark:text-[#F4F4F5] mb-2">
              NO MATCHING ARCHIVAL PRINTS
            </div>
            <p className="font-serif-editorial text-sm text-[#57534E] dark:text-[#A1A1AA] max-w-md mx-auto mb-4">
              {selectedTypeFilter !== 'ALL'
                ? `No ${selectedTypeFilter === 'movie' ? 'films' : 'series'} matched the search. Try selecting 'ALL PRINTS'.`
                : `No IMDb registered titles matched “${query}”. Check spelling or try popular titles like “Stranger Things”, “Spider-Man”, “The Last of Us”, or “Breaking Bad”.`}
            </p>
            <div className="flex justify-center gap-2">
              {selectedTypeFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSelectedTypeFilter('ALL')}
                  className="px-4 py-2 bg-[#141414] text-[#FAF9F6] dark:bg-[#F4F4F5] dark:text-[#141414] text-xs font-condensed uppercase tracking-widest hover:bg-[#2B2A27] cursor-pointer"
                >
                  RESET CATEGORY FILTER
                </button>
              )}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-4 py-2 border border-[#141414] dark:border-[#27272A] text-[#141414] dark:text-[#F4F4F5] text-xs font-condensed uppercase tracking-widest hover:bg-[#141414]/10 cursor-pointer"
                >
                  VIEW ALL CATALOGUE PRINTS
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredResults.map((item) => {
              const isTvSeries = item.type === 'tv';
              const totalEps =
                item.seasons?.reduce((acc, s) => acc + s.episodes.length, 0) ||
                (item.seasonsCount ? item.seasonsCount * 8 : null);

              return (
                <div key={item.id} className="flex flex-col">
                  <EditorialMovieCard
                    item={item}
                    onPlay={onPlay}
                    onOpenDetails={onOpenDetails}
                    onSelectActor={onSelectActor}
                    watchlist={watchlist}
                    onToggleWatchlist={onToggleWatchlist}
                  />

                  {/* Series Episode Browser Quick-Action */}
                  {isTvSeries && (
                    <button
                      type="button"
                      onClick={() => handleToggleExpandSeries(item)}
                      className="mt-1.5 py-1 px-2 border border-[#141414]/30 dark:border-[#27272A] bg-[#FAF9F6] dark:bg-[#18181B] hover:bg-[#141414] hover:text-[#FAF9F6] dark:hover:bg-[#00A3FF] dark:hover:text-black text-[10px] font-mono uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer"
                      title="View all seasons and episodes for this series"
                    >
                      <span className="truncate">
                        {totalEps ? `EPISODES (${totalEps})` : 'ALL EPISODES'}
                      </span>
                      {expandedSeriesId === item.id ? (
                        <ChevronUp className="w-3 h-3 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 shrink-0" />
                      )}
                    </button>
                  )}

                  {/* Direct streaming badge */}
                  <div className="mt-1 pt-1 border-t border-[#141414]/15 dark:border-[#27272A] text-[10px] font-mono text-[#57534E] dark:text-[#A1A1AA] flex items-center justify-between">
                    <span className="truncate">
                      STREAM: <span className="font-bold text-[#141414] dark:text-[#F4F4F5]">1080p HD</span>
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};
