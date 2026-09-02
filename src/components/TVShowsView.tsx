import React, { useState, useMemo } from 'react';
import { MediaItem } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { EditorialFilterBar, FilterState } from './EditorialFilterBar';

interface TVShowsViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
}

export const TVShowsView: React.FC<TVShowsViewProps> = ({
  items,
  onPlay,
  onOpenDetails,
  onSelectActor,
  watchlist,
  onToggleWatchlist,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    type: 'tv',
    genre: 'All Genres',
    year: 'All Years',
    country: 'All Countries',
    provider: 'All Providers',
    sortBy: 'popular',
  });

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: 'tv',
      genre: 'All Genres',
      year: 'All Years',
      country: 'All Countries',
      provider: 'All Providers',
      sortBy: 'popular',
    });
  };

  const filteredShows = useMemo(() => {
    return items
      .filter((i) => i.type === 'tv')
      .filter((t) => {
        if (filters.genre !== 'All Genres' && !t.genres.includes(filters.genre)) return false;
        if (filters.year !== 'All Years' && t.releaseYear.toString() !== filters.year) return false;
        if (filters.country !== 'All Countries' && t.country !== filters.country) return false;
        if (filters.provider !== 'All Providers' && t.streamingProvider !== filters.provider) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'rating-desc') return b.imdbRating - a.imdbRating;
        if (filters.sortBy === 'year-desc') return b.releaseYear - a.releaseYear;
        if (filters.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return (b.communityRating || 0) - (a.communityRating || 0);
      });
  }, [items, filters]);

  return (
    <div id="tv-series-view" className="py-8">
      {/* Editorial Header */}
      <div className="border-b-2 border-[#141414] pb-4 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
          SECTION 02 · SERIAL EDITIONS & EPISODIC ARCHIVE
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mt-1">
          <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414]">
            TV SERIES
          </h1>
          <p className="font-serif-editorial text-sm sm:text-base text-[#57534E] max-w-lg text-left md:text-right">
            Multi-part episodic narratives, anthology sagas, and prestige limited series.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <EditorialFilterBar
        filters={filters}
        onChangeFilter={handleFilterChange}
        onResetFilters={handleResetFilters}
        resultsCount={filteredShows.length}
      />

      {/* Responsive Movie/TV Grid (Section 11: 5-6 desktop, 2 mobile) */}
      {filteredShows.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredShows.map((item) => (
            <EditorialMovieCard
              key={item.id}
              item={item}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              onSelectActor={onSelectActor}
              watchlist={watchlist}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-[#141414]/30 bg-[#F4F1EA] p-8">
          <h3 className="font-condensed text-2xl font-bold uppercase text-[#141414] mb-2">
            NO TV SERIES FOUND IN CURRENT QUERY
          </h3>
          <p className="font-serif-editorial text-sm text-[#57534E] mb-4">
            Try adjusting your genre or streaming provider filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#141414] text-[#FAF9F6] font-condensed uppercase tracking-wider text-xs font-bold"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}
    </div>
  );
};
