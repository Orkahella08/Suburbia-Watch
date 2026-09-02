import React from 'react';
import { NavTab } from '../types';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="mt-20 border-t-2 border-[#141414] bg-[#DDD9CE] text-[#141414] py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-baseline justify-between gap-6 border-b border-[#141414]/20 pb-8">
          <div>
            <div className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414]">
              SUBURBIA WATCH
            </div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#78716C] mt-1">
              A CURATED COLLECTION OF CINEMA · NO ACCOUNT REQUIRED
            </div>
            <p className="font-serif-editorial text-xs text-[#57534E] max-w-md mt-2 leading-relaxed">
              Curated vintage editorial film catalog combining cinema magazine heritage with responsive streaming. Open access with no sign up, login, passwords, or authentication.
            </p>
          </div>

          {/* Text-based Nav Links (Section 15) */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-condensed text-sm uppercase tracking-wider">
            <button
              onClick={() => onSelectTab('home')}
              className="hover:text-[#57534E] cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onSelectTab('movies')}
              className="hover:text-[#57534E] cursor-pointer"
            >
              Movies
            </button>
            <button
              onClick={() => onSelectTab('tv')}
              className="hover:text-[#57534E] cursor-pointer"
            >
              TV Shows
            </button>
            <button
              onClick={() => onSelectTab('genres')}
              className="hover:text-[#57534E] cursor-pointer"
            >
              Genres
            </button>
            <button
              onClick={() => onSelectTab('providers')}
              className="hover:text-[#57534E] cursor-pointer"
            >
              Providers
            </button>
            <button
              onClick={() => onSelectTab('search')}
              className="hover:text-[#57534E] cursor-pointer"
            >
              Search
            </button>
            <button
              onClick={() => onSelectTab('watchlist')}
              className="hover:text-[#57534E] cursor-pointer"
            >
              Watchlist
            </button>
          </div>
        </div>

        {/* Colophon & Archival Disclaimer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
          <div>
            SUBURBIA WATCH · 2:3 POSTER RATIOS · 16:9 HERO BACKDROPS
          </div>
          <div>
            IMDb METADATA · ZERO LOGIN ARCHITECTURE · STORED LOCALLY
          </div>
        </div>
      </div>
    </footer>
  );
};
