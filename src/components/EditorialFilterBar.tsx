import React from 'react';
import { GENRES_LIST, COUNTRIES_LIST, YEARS_LIST, PROVIDERS_LIST } from '../data/mockData';
import { RotateCcw } from 'lucide-react';

export interface FilterState {
  type: 'all' | 'movie' | 'tv';
  genre: string;
  year: string;
  country: string;
  provider: string;
  sortBy: 'popular' | 'rating-desc' | 'year-desc' | 'title-asc';
}

interface EditorialFilterBarProps {
  filters: FilterState;
  onChangeFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  resultsCount: number;
}

export const EditorialFilterBar: React.FC<EditorialFilterBarProps> = ({
  filters,
  onChangeFilter,
  onResetFilters,
  resultsCount,
}) => {
  const isFiltered =
    filters.type !== 'all' ||
    filters.genre !== 'All Genres' ||
    filters.year !== 'All Years' ||
    filters.country !== 'All Countries' ||
    filters.provider !== 'All Providers' ||
    filters.sortBy !== 'popular';

  return (
    <div className="border-y border-[#141414]/25 py-4 mb-8 bg-[#E8E5DC]">
      <div className="flex flex-col gap-4">
        {/* Type toggle text links */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#141414]/15 pb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mr-2">
              FORMAT:
            </span>
            <button
              type="button"
              onClick={() => onChangeFilter('type', 'all')}
              className={`px-3 py-1 text-xs font-condensed uppercase tracking-wider transition-colors cursor-pointer border ${
                filters.type === 'all'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold'
                  : 'border-transparent text-[#57534E] hover:text-[#141414]'
              }`}
            >
              ALL REPERTOIRE
            </button>
            <button
              type="button"
              onClick={() => onChangeFilter('type', 'movie')}
              className={`px-3 py-1 text-xs font-condensed uppercase tracking-wider transition-colors cursor-pointer border ${
                filters.type === 'movie'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold'
                  : 'border-transparent text-[#57534E] hover:text-[#141414]'
              }`}
            >
              FEATURE FILMS
            </button>
            <button
              type="button"
              onClick={() => onChangeFilter('type', 'tv')}
              className={`px-3 py-1 text-xs font-condensed uppercase tracking-wider transition-colors cursor-pointer border ${
                filters.type === 'tv'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold'
                  : 'border-transparent text-[#57534E] hover:text-[#141414]'
              }`}
            >
              TV SERIES
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#57534E] tracking-wider uppercase">
              SHOWING <strong className="text-[#141414]">{resultsCount}</strong> TITLES
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-mono uppercase text-[#78716C] hover:text-[#141414] underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET FILTERS</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Editorial Dropdowns Grid (Section 9) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Genre Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
              GENRE
            </label>
            <select
              value={filters.genre}
              onChange={(e) => onChangeFilter('genre', e.target.value)}
              className="bg-[#F4F1EA] text-[#141414] border border-[#141414]/30 px-2.5 py-1.5 text-xs font-sans uppercase tracking-wide cursor-pointer focus:outline-none focus:border-[#141414] rounded-none"
            >
              {GENRES_LIST.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Release Year Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
              RELEASE YEAR
            </label>
            <select
              value={filters.year}
              onChange={(e) => onChangeFilter('year', e.target.value)}
              className="bg-[#F4F1EA] text-[#141414] border border-[#141414]/30 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wide cursor-pointer focus:outline-none focus:border-[#141414] rounded-none"
            >
              {YEARS_LIST.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Country of Origin Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
              COUNTRY
            </label>
            <select
              value={filters.country}
              onChange={(e) => onChangeFilter('country', e.target.value)}
              className="bg-[#F4F1EA] text-[#141414] border border-[#141414]/30 px-2.5 py-1.5 text-xs font-sans uppercase tracking-wide cursor-pointer focus:outline-none focus:border-[#141414] rounded-none"
            >
              {COUNTRIES_LIST.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Streaming Provider Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
              PROVIDER
            </label>
            <select
              value={filters.provider}
              onChange={(e) => onChangeFilter('provider', e.target.value)}
              className="bg-[#F4F1EA] text-[#141414] border border-[#141414]/30 px-2.5 py-1.5 text-xs font-sans uppercase tracking-wide cursor-pointer focus:outline-none focus:border-[#141414] rounded-none"
            >
              <option value="All Providers">ALL PROVIDERS</option>
              {PROVIDERS_LIST.map((provider) => (
                <option key={provider} value={provider}>
                  {provider.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By: Most Popular, Highest Rated, Release Date, Title A–Z */}
          <div className="flex flex-col">
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
              SORT BY
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChangeFilter(
                  'sortBy',
                  e.target.value as FilterState['sortBy']
                )
              }
              className="bg-[#F4F1EA] text-[#141414] border border-[#141414]/30 px-2.5 py-1.5 text-xs font-sans uppercase tracking-wide cursor-pointer focus:outline-none focus:border-[#141414] rounded-none font-medium"
            >
              <option value="popular">MOST POPULAR</option>
              <option value="rating-desc">HIGHEST RATED</option>
              <option value="year-desc">RELEASE DATE (NEWEST)</option>
              <option value="title-asc">TITLE (A–Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
