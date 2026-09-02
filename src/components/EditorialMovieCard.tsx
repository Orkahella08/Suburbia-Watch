import React from 'react';
import { MediaItem } from '../types';
import { Bookmark, BookmarkCheck, Play, Info, Star } from 'lucide-react';

interface EditorialMovieCardProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
}

export const EditorialMovieCard: React.FC<EditorialMovieCardProps> = ({
  item,
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
}) => {
  const isSaved = watchlist.includes(item.id);

  return (
    <article
      id={`film-card-${item.id}`}
      className="group flex flex-col cursor-pointer select-none"
      onClick={() => onOpenDetails(item)}
    >
      {/* 2:3 Portrait Artwork Container */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#141414] border border-[#141414] shadow-[0_2px_4px_rgba(0,0,0,0.08)] group-hover:shadow-[0_6px_14px_rgba(0,0,0,0.18)] transition-all duration-300">
        <img
          src={item.posterUrl}
          alt={item.title}
          className="w-full h-full object-cover film-photo-treatment transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Subtle Archival Tag */}
        {item.neighborhoodBadge && (
          <div className="absolute top-2 left-2 bg-[#141414]/90 text-[#FAF9F6] text-[8px] sm:text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-mono border border-white/20">
            {item.neighborhoodBadge}
          </div>
        )}

        {/* Top Right Save Bookmark Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(item);
          }}
          className={`absolute top-2 right-2 p-1.5 border transition-all z-10 cursor-pointer ${
            isSaved
              ? 'bg-[#141414] text-[#FAF9F6] border-[#141414]'
              : 'bg-[#FAF9F6]/90 text-[#141414] border-[#141414]/40 opacity-0 group-hover:opacity-100 hover:bg-white'
          }`}
          title={isSaved ? 'Remove from Archival Index' : 'Save to Index'}
          aria-label={isSaved ? 'In Archival Index' : 'Add to Archival Index'}
        >
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
        </button>

        {/* Minimal Hover Controls Overlay */}
        <div className="absolute inset-0 bg-[#141414]/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay(item);
              }}
              className="flex-1 bg-[#FAF9F6] text-[#141414] hover:bg-white text-[11px] font-condensed uppercase tracking-wider font-bold py-1.5 px-2 flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>WATCH</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(item);
              }}
              className="bg-[#141414]/80 text-[#FAF9F6] hover:bg-[#141414] border border-white/30 text-[11px] font-condensed uppercase tracking-wider py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Info className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Minimal Information Underneath */}
      <div className="pt-2 sm:pt-2.5 pb-1 flex flex-col">
        {/* Title & Year */}
        <div className="flex items-baseline justify-between gap-1.5">
          <h2 className="font-condensed text-base sm:text-lg font-bold uppercase tracking-tight text-[#141414] truncate leading-tight group-hover:text-[#57534E] transition-colors">
            {item.title}
          </h2>
          <span className="font-mono text-xs sm:text-sm text-[#57534E] shrink-0">
            {item.releaseYear}
          </span>
        </div>

        {/* Genre · Duration / Seasons */}
        <div className="text-[10px] sm:text-[11px] font-mono text-[#78716C] uppercase tracking-wide truncate mt-0.5">
          {item.genres.slice(0, 2).join(' · ')}
        </div>

        {/* Provider Availability & IMDb Rating */}
        <div className="mt-1 flex items-center justify-between text-[9px] sm:text-[10px] font-mono border-t border-[#141414]/15 pt-1 text-[#57534E]">
          <span className="uppercase tracking-wider">
            AVAILABLE ON <strong className="text-[#141414]">{item.streamingProvider.toUpperCase()}</strong>
          </span>
          <span className="font-semibold text-[#141414] shrink-0 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-current text-[#141414]" />
            {item.imdbRating}
          </span>
        </div>
      </div>
    </article>
  );
};
