import React from 'react';
import { STREAMING_PLATFORMS, StreamingPlatform } from '../services/imdbService';
import { Tv, Check } from 'lucide-react';

interface ExploreStreamingPlatformsProps {
  selectedPlatform: string | null;
  onSelectPlatform: (platformName: string | null) => void;
}

export const ExploreStreamingPlatforms: React.FC<ExploreStreamingPlatformsProps> = ({
  selectedPlatform,
  onSelectPlatform,
}) => {
  return (
    <section id="explore-streaming-platforms" className="mb-14 border-t-2 border-b-2 border-[#141414] py-8 bg-[#F4F1EA]">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
            DISTRIBUTION INDEX · CATALOGUE FILTERING
          </div>
          <h2 className="font-condensed text-2xl sm:text-3xl font-bold uppercase tracking-wider text-[#141414]">
            EXPLORE STREAMING PLATFORMS
          </h2>
        </div>
        <div className="text-xs font-mono text-[#57534E]">
          {selectedPlatform ? (
            <div className="flex items-center gap-2">
              <span>FILTER ACTIVE:</span>
              <span className="font-bold text-[#141414] uppercase bg-[#FAF9F6] border border-[#141414] px-2 py-0.5">
                {selectedPlatform}
              </span>
              <button
                type="button"
                onClick={() => onSelectPlatform(null)}
                className="underline hover:text-[#141414] cursor-pointer"
              >
                CLEAR FILTER
              </button>
            </div>
          ) : (
            <span>SELECT PLATFORM TO FILTER CATALOGUE PRINTS</span>
          )}
        </div>
      </div>

      {/* Network Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {STREAMING_PLATFORMS.map((platform: StreamingPlatform) => {
          const isSelected = selectedPlatform === platform.name;
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => onSelectPlatform(isSelected ? null : platform.name)}
              className={`p-4 text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-between min-h-[110px] relative group ${
                isSelected
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] shadow-md -translate-y-0.5'
                  : 'bg-[#FAF9F6] text-[#141414] border-[#141414]/30 hover:border-[#141414] hover:bg-[#FAF9F6]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 text-[9px] font-mono flex items-center gap-0.5 bg-[#FAF9F6] text-[#141414] px-1 font-bold">
                  <Check className="w-2.5 h-2.5" />
                  <span>ON</span>
                </div>
              )}

              {/* Minimal Platform Badge */}
              <div
                className="w-8 h-8 rounded-none border border-current flex items-center justify-center font-condensed font-bold text-xs uppercase mb-2 tracking-wider"
                style={{
                  borderColor: isSelected ? '#FAF9F6' : '#141414',
                }}
              >
                {platform.badge}
              </div>

              {/* Platform Label */}
              <div>
                <div className="font-condensed text-sm sm:text-base font-bold uppercase tracking-wider line-clamp-1">
                  {platform.name}
                </div>
                <div className="text-[9px] font-mono text-[#78716C] group-hover:text-current mt-0.5 uppercase tracking-tight">
                  Archive Filter
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
