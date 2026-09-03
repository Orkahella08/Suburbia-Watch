import React, { useState } from 'react';
import { MediaItem, StreamingProvider } from '../types';
import { EditorialMovieCard } from './EditorialMovieCard';
import { PROVIDERS_LIST } from '../data/mockData';
import { Tv, ExternalLink } from 'lucide-react';

interface ProvidersViewProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
}

const PROVIDER_INFO: Record<string, { description: string; regionNote: string }> = {
  Netflix: {
    description: 'Pioneering global digital distributor featuring acclaimed original series and auteur acquisitions.',
    regionNote: 'Global availability subject to localized distributor territorial rights.',
  },
  'HBO Max': {
    description: 'Prestige serials, Warner Bros. cinematic library, and seminal high-budget television drama.',
    regionNote: 'Available in North America, Latin America, and European Max territories.',
  },
  Max: {
    description: 'Warner Bros. Discovery streaming platform featuring HBO, DC, and Warner Bros. movies.',
    regionNote: 'Available in North America, Latin America, Europe, and expanding globally.',
  },
  'Disney+': {
    description: 'Epic historical dramas, prestigious international co-productions, and sprawling multi-season sagas.',
    regionNote: 'Global availability with Star/Hulu integration depending on territory.',
  },
  Hulu: {
    description: 'Cutting-edge independent television, contemporary American indie features, and modern dark comedies.',
    regionNote: 'Available primarily in the United States and via international partner networks.',
  },
  Viu: {
    description: 'Specialized Asian cinema curator spotlighting celebrated South Korean auteur drama and East Asian thrillers.',
    regionNote: 'Available across Southeast Asia, the Middle East, and South Africa.',
  },
  'Amazon Prime Video': {
    description: 'Major studio blockbusters, celebrated theatrical auteur awards contenders, and worldwide streaming originals.',
    regionNote: 'Worldwide availability across 200+ territories.',
  },
  'Prime Video': {
    description: 'Major studio blockbusters, celebrated theatrical auteur awards contenders, and worldwide streaming originals.',
    regionNote: 'Worldwide availability across 200+ territories.',
  },
  'Apple TV+': {
    description: 'Curated auteur dramas, visually opulent science fiction, and Emmy/Oscar-winning boutique productions.',
    regionNote: 'Global availability via the Apple TV ecosystem and modern web browsers.',
  },
  'Apple TV': {
    description: 'Curated auteur dramas, visually opulent science fiction, and Emmy/Oscar-winning boutique productions.',
    regionNote: 'Global availability via the Apple TV ecosystem and modern web browsers.',
  },
  'Paramount+': {
    description: 'Paramount pictures, CBS network classics, and exclusive streaming productions.',
    regionNote: 'Available across North America, Latin America, Australia, and Europe.',
  },
  Peacock: {
    description: 'Universal Pictures, NBC classics, and premier live television programming.',
    regionNote: 'Available in the United States and select European territories.',
  },
  YouTube: {
    description: 'Worldwide video platform with official movie rentals, digital storefronts, and creator content.',
    regionNote: 'Available worldwide across all major devices.',
  },
  'Google TV': {
    description: 'Google digital storefront for movie purchases, 4K digital rentals, and library aggregation.',
    regionNote: 'Available worldwide across Android, Google TV, and web browsers.',
  },
};

export const ProvidersView: React.FC<ProvidersViewProps> = ({
  items,
  onPlay,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
  onSelectActor,
}) => {
  const [activeProvider, setActiveProvider] = useState<StreamingProvider>('HBO Max');

  const matchingItems = items.filter((item) => {
    if (item.streamingProvider === activeProvider) return true;
    if (item.availableProviders && item.availableProviders.includes(activeProvider)) return true;
    return false;
  });

  const info = PROVIDER_INFO[activeProvider];

  return (
    <div id="providers-view" className="py-8">
      {/* Section Masthead */}
      <div className="border-b-2 border-[#141414] pb-4 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
          SECTION 04 · STREAMING PLATFORM REPERTORY INDEX
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mt-1">
          <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414]">
            WATCH BY PROVIDER
          </h1>
          <p className="font-serif-editorial text-sm sm:text-base text-[#57534E] max-w-lg text-left md:text-right">
            Discover where films and television series reside across major international streaming networks.
          </p>
        </div>
      </div>

      {/* Provider Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#141414]/15">
        {PROVIDERS_LIST.map((provider) => {
          const count = items.filter(
            (i) => i.streamingProvider === provider || i.availableProviders?.includes(provider)
          ).length;
          const isActive = activeProvider === provider;

          return (
            <button
              key={provider}
              onClick={() => setActiveProvider(provider)}
              className={`px-4 py-2 text-xs font-condensed uppercase tracking-wider shrink-0 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold shadow-xs'
                  : 'bg-[#F4F1EA] text-[#141414] border-[#141414]/30 hover:border-[#141414]'
              }`}
            >
              <span>{provider}</span>
              <span className="font-mono text-[10px] ml-1.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Selected Provider Editorial Overview Block */}
      <div className="bg-[#F4F1EA] border border-[#141414]/30 p-5 sm:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
            DISTRIBUTION PLATFORM DOSSIER
          </div>
          <h2 className="font-condensed text-3xl font-bold uppercase tracking-tight text-[#141414]">
            {activeProvider}
          </h2>
          <p className="font-serif-editorial text-sm text-[#57534E] max-w-2xl mt-1">
            {info?.description}
          </p>
          <div className="text-[11px] font-mono text-[#78716C] mt-2">
            TERRITORIAL ADVISORY: {info?.regionNote}
          </div>
        </div>

        <div className="text-right shrink-0 border-t md:border-t-0 md:border-l border-[#141414]/20 pt-3 md:pt-0 md:pl-6 font-mono text-xs">
          <div className="text-[#78716C] uppercase">ARCHIVE AVAILABILITY</div>
          <div className="font-condensed text-2xl font-bold text-[#141414] uppercase mt-0.5">
            {matchingItems.length} {matchingItems.length === 1 ? 'SELECTION' : 'SELECTIONS'}
          </div>
        </div>
      </div>

      {/* Matching Items Grid */}
      {matchingItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {matchingItems.map((item) => (
            <EditorialMovieCard
              key={item.id}
              item={item}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              watchlist={watchlist}
              onToggleWatchlist={onToggleWatchlist}
              onSelectActor={onSelectActor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-[#141414]/30 bg-[#F4F1EA] p-8">
          <p className="font-serif-editorial text-sm text-[#57534E]">
            No titles currently catalogued under this streaming provider.
          </p>
        </div>
      )}
    </div>
  );
};
