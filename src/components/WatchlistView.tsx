import React, { useState } from 'react';
import { MediaItem } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react';

interface WatchlistViewProps {
  watchlistIds: string[];
  allItems: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
  onExplore: () => void;
  onClearAll?: () => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlistIds,
  allItems,
  onPlay,
  onOpenDetails,
  onToggleWatchlist,
  onSelectActor,
  onExplore,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');

  const savedItems = allItems.filter((item) => watchlistIds.includes(item.id));
  const filteredItems = savedItems.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div id="archival-index-view" className="py-8">
      {/* Editorial Header */}
      <div className="border-b-2 border-[#141414] pb-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
              SECTION 06 · PRIVATE REPERTORY ARCHIVE (LOCAL STORAGE)
            </div>
            <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414]">
              WATCHLIST
            </h1>
            <p className="font-serif-editorial text-[#57534E] text-sm mt-1">
              Saved motion pictures and serial editions preserved locally without an account.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="font-mono text-sm uppercase tracking-wider text-[#141414]">
              <strong>{savedItems.length}</strong> {savedItems.length === 1 ? 'TITLE' : 'TITLES'} INDEXED
            </div>
            {savedItems.length > 0 && onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] hover:text-[#141414] underline cursor-pointer"
              >
                CLEAR ALL
              </button>
            )}
          </div>
        </div>

        {/* Format Filter Links */}
        {savedItems.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#141414]/15">
            <span className="text-[10px] font-mono uppercase text-[#78716C] mr-2">
              FORMAT:
            </span>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-condensed uppercase tracking-wider border cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold'
                  : 'bg-transparent text-[#57534E] border-transparent hover:text-[#141414]'
              }`}
            >
              ALL ({savedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('movie')}
              className={`px-3 py-1 text-xs font-condensed uppercase tracking-wider border cursor-pointer ${
                filter === 'movie'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold'
                  : 'bg-transparent text-[#57534E] border-transparent hover:text-[#141414]'
              }`}
            >
              FEATURE FILMS ({savedItems.filter((i) => i.type === 'movie').length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('tv')}
              className={`px-3 py-1 text-xs font-condensed uppercase tracking-wider border cursor-pointer ${
                filter === 'tv'
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold'
                  : 'bg-transparent text-[#57534E] border-transparent hover:text-[#141414]'
              }`}
            >
              TV SERIES ({savedItems.filter((i) => i.type === 'tv').length})
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="border border-[#141414]/30 bg-[#F4F1EA] p-12 text-center my-8">
          <Bookmark className="w-10 h-10 text-[#78716C] mx-auto mb-3" />
          <div className="font-condensed text-2xl font-bold uppercase text-[#141414] mb-2">
            NO TITLES CURRENTLY SAVED
          </div>
          <p className="font-serif-editorial text-sm text-[#57534E] max-w-md mx-auto mb-6">
            Your personal watchlist is empty. Click the bookmark symbol on any movie or TV series to save it for immediate offline reference in this session.
          </p>
          <button
            type="button"
            onClick={onExplore}
            className="px-6 py-3 bg-[#141414] text-[#FAF9F6] text-xs font-condensed uppercase tracking-widest hover:bg-[#2B2A27] cursor-pointer inline-flex items-center gap-2"
          >
            <span>BROWSE CATALOGUE</span>
            <ArrowRight className="w-4 h-4" />
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
              onSelectActor={onSelectActor}
              watchlist={watchlistIds}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
