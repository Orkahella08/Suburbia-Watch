import React from 'react';
import { MediaItem, WatchProgress } from '../types';
import { Play, Trash2, Clock, Film, Tv } from 'lucide-react';
import { PosterImage } from './PosterImage';

interface ContinueWatchingShelfProps {
  progressList: WatchProgress[];
  allMedia: MediaItem[];
  onResume: (progress: WatchProgress) => void;
  onClearProgress: (mediaId?: string) => void;
}

export const ContinueWatchingShelf: React.FC<ContinueWatchingShelfProps> = ({
  progressList,
  allMedia,
  onResume,
  onClearProgress,
}) => {
  if (!progressList || progressList.length === 0) return null;

  return (
    <section id="continue-watching-shelf" className="mb-12 border-b border-[#141414]/20 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
            ACTIVE PROJECTIONS · LOCAL PROGRESS
          </div>
          <h2 className="font-condensed text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#141414]">
            CONTINUE WATCHING
          </h2>
        </div>
        <button
          onClick={() => onClearProgress()}
          className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] hover:text-[#141414] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          title="Clear all stored playback progress"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>CLEAR ALL SESSIONS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {progressList.map((prog) => {
          const media = allMedia.find((m) => m.id === prog.mediaId);
          if (!media) return null;

          const pct = prog.totalSeconds > 0
            ? Math.min(100, Math.max(5, Math.round((prog.progressSeconds / prog.totalSeconds) * 100)))
            : 25;

          return (
            <div
              key={prog.mediaId}
              className="bg-[#F4F1EA] border border-[#141414]/30 hover:border-[#141414] p-3 flex gap-3 transition-colors group cursor-pointer"
              onClick={() => onResume(prog)}
            >
              {/* Poster thumbnail (2:3) */}
              <div className="relative w-16 sm:w-20 aspect-[2/3] bg-[#141414] shrink-0 overflow-hidden border border-[#141414]">
                <PosterImage
                  src={media.posterUrl}
                  alt={media.title}
                  imdbId={media.imdbId}
                  title={media.title}
                  year={media.releaseYear}
                  aspectRatio="2/3"
                  loading="lazy"
                  imgClassName="film-photo-treatment"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                  <div className="w-7 h-7 bg-[#FAF9F6] text-[#141414] flex items-center justify-center rounded-full shadow-md">
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Information & Progress Bar */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#78716C] uppercase">
                    <span>{prog.type === 'tv' ? 'EPISODE SESSION' : 'FEATURE FILM'}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearProgress(prog.mediaId);
                      }}
                      className="p-1 text-[#78716C] hover:text-[#141414] cursor-pointer"
                      title="Remove this progress item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <h3 className="font-condensed text-lg font-bold uppercase tracking-tight text-[#141414] leading-tight line-clamp-1">
                    {prog.title}
                  </h3>

                  {prog.type === 'tv' && (
                    <p className="text-xs font-serif-editorial text-[#57534E] line-clamp-1 mt-0.5">
                      S{prog.seasonNumber?.toString().padStart(2, '0')} E{prog.episodeNumber?.toString().padStart(2, '0')} · {prog.episodeTitle || 'Episode'}
                    </p>
                  )}
                </div>

                <div className="space-y-1 mt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#78716C]">
                    <span>RESUME AT {prog.formattedTime || 'IN PROGRESS'}</span>
                    <span className="font-semibold text-[#141414]">{pct}%</span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full h-1 bg-[#141414]/15 overflow-hidden">
                    <div
                      className="h-full bg-[#141414] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
