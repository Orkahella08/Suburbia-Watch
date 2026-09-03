import React from 'react';
import { MediaItem, WatchProgress } from '../types';
import { Play, Plus, Check, Star, Info, Trash2 } from 'lucide-react';
import { PosterImage } from './PosterImage';

interface MediaCardProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  inWatchlist: boolean;
  onToggleWatchlist: (item: MediaItem) => void;
  progress?: WatchProgress;
  onRemoveProgress?: (mediaId: string) => void;
  aspectRatio?: 'poster' | 'backdrop';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onPlay,
  onOpenDetails,
  inWatchlist,
  onToggleWatchlist,
  progress,
  onRemoveProgress,
  aspectRatio = 'backdrop',
}) => {
  const isPoster = aspectRatio === 'poster';
  const imageUrl = isPoster ? item.posterUrl : (item.backdropUrl || item.posterUrl);

  const percentWatched = progress && progress.totalSeconds > 0
    ? Math.min(100, Math.round((progress.progressSeconds / progress.totalSeconds) * 100))
    : 0;

  const timeLeftMinutes = progress && progress.totalSeconds > 0
    ? Math.max(1, Math.round((progress.totalSeconds - progress.progressSeconds) / 60))
    : 0;

  return (
    <div
      id={`media-card-${item.id}`}
      className={`group relative flex-none rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1 ${
        isPoster ? 'w-[170px] sm:w-[200px]' : 'w-[260px] sm:w-[320px]'
      }`}
    >
      {/* Image Container */}
      <div className={`relative w-full overflow-hidden ${isPoster ? 'h-[250px] sm:h-[290px]' : 'h-[155px] sm:h-[185px]'}`}>
        <PosterImage
          src={imageUrl}
          alt={item.title}
          imdbId={item.imdbId}
          title={item.title}
          year={item.releaseYear}
          aspectRatio={isPoster ? '2/3' : '16/9'}
          loading="lazy"
          imgClassName="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Neighborhood Badge */}
        {item.neighborhoodBadge && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/90 text-zinc-950 shadow-sm backdrop-blur-sm">
              {item.neighborhoodBadge}
            </span>
          </div>
        )}

        {/* Type pill */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-900/90 text-zinc-300 border border-zinc-700">
            {item.type === 'tv' ? 'TV' : 'MOVIE'}
          </span>
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]">
          {/* Quick Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="p-3 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg transform transition-transform hover:scale-110 cursor-pointer"
            aria-label={`Play ${item.title}`}
            title="Play Now"
          >
            <Play className="w-5 h-5 fill-zinc-950 text-zinc-950" />
          </button>

          {/* Quick Watchlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(item);
            }}
            className="p-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-600 shadow-md transform transition-transform hover:scale-105 cursor-pointer"
            aria-label="Toggle Watchlist"
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            {inWatchlist ? (
              <Check className="w-4 h-4 text-amber-400" />
            ) : (
              <Plus className="w-4 h-4 text-zinc-200" />
            )}
          </button>

          {/* Quick Info Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(item);
            }}
            className="p-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-600 shadow-md transform transition-transform hover:scale-105 cursor-pointer"
            aria-label="View Details"
            title="More Details"
          >
            <Info className="w-4 h-4 text-zinc-200" />
          </button>
        </div>

        {/* Continue Watching Progress Bar on image bottom */}
        {progress && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="w-full bg-zinc-800/80 h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${percentWatched}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Info Details */}
      <div className="p-3 sm:p-3.5 space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <h3
            onClick={() => onOpenDetails(item)}
            className="font-bold text-sm sm:text-base text-zinc-100 hover:text-amber-400 transition-colors cursor-pointer truncate"
            title={item.title}
          >
            {item.title}
          </h3>
          {onRemoveProgress && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveProgress(item.id);
              }}
              className="p-1 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title="Remove from Continue Watching"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Meta subtitle */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center text-amber-400 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
              {item.communityRating}%
            </span>
            <span>•</span>
            <span>{item.releaseYear}</span>
            <span>•</span>
            <span className="px-1 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700">
              {item.maturityRating}
            </span>
          </div>

          <span className="text-zinc-400 truncate max-w-[80px]">
            {item.type === 'tv' ? `${item.seasonsCount} Seasons` : item.duration}
          </span>
        </div>

        {/* Progress details if continue watching */}
        {progress && (
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800 text-zinc-400">
            <span className="text-amber-300/90 font-medium">
              {progress.episodeId ? 'Next Up' : `${percentWatched}% watched`}
            </span>
            <span>{timeLeftMinutes}m left</span>
          </div>
        )}

        {/* Genre Tags */}
        {!progress && (
          <p className="text-[11px] text-zinc-400 truncate">
            {item.genres.slice(0, 2).join(' • ')}
          </p>
        )}
      </div>
    </div>
  );
};
