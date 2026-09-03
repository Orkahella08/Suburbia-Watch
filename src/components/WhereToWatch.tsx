import React from 'react';
import { MediaItem } from '../types';
import { extractImdbId } from '../utils/imdb';
import { Play, ShieldCheck, Film } from 'lucide-react';

interface WhereToWatchProps {
  media: MediaItem;
  countryCode?: string;
  onSelectCountry?: (countryCode: string) => void;
  showCountrySelector?: boolean;
  onPlayInApp?: () => void;
}

export const WhereToWatch: React.FC<WhereToWatchProps> = ({
  media,
  onPlayInApp,
}) => {
  const cleanId = extractImdbId(media.imdbId) || (media.id.startsWith('tt') ? media.id : 'tt26443597');

  return (
    <div id="where-to-watch-section" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141414]/20 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#141414]" />
          <h3 className="font-condensed text-lg font-bold uppercase tracking-wider text-[#141414]">
            STREAMING SPECIFICATIONS · IN-APP HD PLAYER
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-[#141414] text-[#FAF9F6] font-bold">
          INSTANT STREAM
        </span>
      </div>

      {/* In-App Stream Card */}
      <div className="bg-[#FAF9F6] border-2 border-[#141414] p-4 shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#141414] text-[#00A3FF] flex items-center justify-center font-bold text-sm shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Film className="w-5 h-5 text-[#00A3FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-condensed font-bold text-base tracking-wider uppercase text-[#141414]">
                  Full-Length HD Stream
                </span>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#00A3FF] text-black font-bold">
                  IN-APP PLAYER
                </span>
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-[#10B981]/20 text-[#047857] border border-[#10B981]/40 font-bold">
                  NO SUBSCRIPTION REQUIRED
                </span>
              </div>
              <p className="font-mono text-xs text-[#57534E] mt-1">
                Full-length stream direct inside the website player ({cleanId}). Zero ads, no rental or digital store purchase needed.
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[#78716C]">
                <span>Format: 1080p HD</span>
                <span>·</span>
                <span>Multi-Audio & Subtitles</span>
                <span>·</span>
                <span>Instant Playback</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Single In-App Action: Watch Now */}
            <button
              type="button"
              id="watch-player-merged-btn"
              onClick={() => {
                onPlayInApp?.();
              }}
              className="px-6 py-3 font-condensed font-bold text-xs sm:text-sm uppercase tracking-wider bg-[#141414] text-[#FAF9F6] hover:bg-[#00A3FF] hover:text-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-y-0.5"
              title="Stream inside the player"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>WATCH NOW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
