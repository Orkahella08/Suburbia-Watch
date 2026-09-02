import React, { useState, useMemo } from 'react';
import { MediaItem } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { EditorialFilterBar, FilterState } from './EditorialFilterBar';

interface MoviesViewProps {
  movies: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
}

export const MoviesView: React.FC<MoviesViewProps> = ({
  movies,
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
  onSelectActor,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    type: 'movie',
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
      type: 'movie',
      genre: 'All Genres',
      year: 'All Years',
      country: 'All Countries',
      provider: 'All Providers',
      sortBy: 'popular',
    });
  };

  const filteredMovies = useMemo(() => {
    return movies
      .filter((m) => m.type === 'movie')
      .filter((m) => {
        if (filters.genre !== 'All Genres' && !m.genres.includes(filters.genre)) return false;
        if (filters.year !== 'All Years' && m.releaseYear.toString() !== filters.year) return false;
        if (filters.country !== 'All Countries' && m.country !== filters.country) return false;
        if (filters.provider !== 'All Providers' && m.streamingProvider !== filters.provider) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'rating-desc') return b.imdbRating - a.imdbRating;
        if (filters.sortBy === 'year-desc') return b.releaseYear - a.releaseYear;
        if (filters.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return (b.communityRating || 0) - (a.communityRating || 0);
      });
  }, [movies, filters]);

  return (
    <div id="movies-view" className="py-8">
      {/* Section Header */}
      <div className="border-b-2 border-[#141414] pb-4 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
          SECTION 01 · 35MM CINEMATOGRAPHIC REPERTOIRE
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mt-1">
          <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414]">
            FEATURE FILMS
          </h1>
          <p className="font-serif-editorial text-sm sm:text-base text-[#57534E] max-w-lg text-left md:text-right">
            Curated feature-length cinema from visionary global filmmakers. No account needed.
          </p>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <EditorialFilterBar
        filters={filters}
        onChangeFilter={handleFilterChange}
        onResetFilters={handleResetFilters}
        resultsCount={filteredMovies.length}
      />

      {/* Responsive Movie Grid (Section 11) */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <EditorialMovieCard
              key={movie.id}
              item={movie}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              watchlist={watchlist}
              onToggleWatchlist={onToggleWatchlist}
              onSelectActor={onSelectActor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-[#141414]/30 bg-[#F4F1EA] p-8">
          <h3 className="font-condensed text-2xl font-bold uppercase text-[#141414] mb-2">
            NO FILMS FOUND IN CURRENT ARCHIVE QUERY
          </h3>
          <p className="font-serif-editorial text-sm text-[#57534E] mb-4">
            Try adjusting your genre, release year, or streaming provider filters.
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
