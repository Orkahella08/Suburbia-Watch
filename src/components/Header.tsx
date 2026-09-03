import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { NavTab } from '../types';
import { Search, Bookmark, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  watchlistCount: number;
  selectedCountry?: string;
  onSelectCountry?: (countryCode: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  watchlistCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Navigation links
  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'HOME' },
    { id: 'movies', label: 'MOVIES' },
    { id: 'tv', label: 'TV SHOWS' },
    { id: 'genres', label: 'GENRES' },
    { id: 'search', label: 'SEARCH' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="suburbia-editorial-header"
      className="sticky top-0 left-0 right-0 z-40 bg-[#E8E5DC] dark:bg-[#0B0B0D] border-b-2 border-[#141414] dark:border-[#27272A] transition-colors"
    >
      {/* Top archival masthead line */}
      <div className="border-b border-[#141414]/15 dark:border-[#27272A] px-4 sm:px-8 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[#78716C] dark:text-[#A1A1AA] flex items-center justify-between">
        <span>SUBURBIA WATCH · A CURATED COLLECTION OF CINEMA</span>
        <span className="hidden sm:inline">NO ACCOUNT REQUIRED · FREE DISCOVERY</span>
        <span className="hidden md:inline">IMDb METADATA ARCHIVE</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Typographic Logo */}
        <button
          id="editorial-logo-btn"
          onClick={() => handleNavClick('home')}
          className="text-left cursor-pointer focus:outline-none"
          aria-label="Suburbia Watch Home"
        >
          <BrandLogo size="md" showTagline={false} />
        </button>

        {/* Desktop Minimalist Text-Based Navigation (Section 15) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`font-condensed text-base tracking-wider uppercase transition-colors cursor-pointer py-1 relative ${
                  isActive
                    ? 'font-bold text-[#141414] dark:text-[#F4F4F5] border-b-2 border-[#141414] dark:border-[#00A3FF]'
                    : 'text-[#57534E] dark:text-[#A1A1AA] hover:text-[#141414] dark:hover:text-[#F4F4F5]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Marvel Mode Trigger Button */}
          <button
            id="nav-marvel-mode"
            type="button"
            onClick={() => handleNavClick('marvel')}
            className={`font-condensed text-sm tracking-wider uppercase flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer font-bold ${
              currentTab === 'marvel'
                ? 'bg-[#E62429] text-white border-[#141414] dark:border-white shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] dark:shadow-none'
                : 'bg-[#E62429]/10 text-[#E62429] dark:text-[#FF6B6B] border-[#E62429]/50 hover:bg-[#E62429] hover:text-white dark:hover:text-white hover:border-[#E62429]'
            }`}
          >
            <span className="w-2 h-2 bg-[#E62429] rounded-full inline-block animate-pulse" />
            <span>MARVEL MODE</span>
          </button>

          {/* Watchlist Quick Access Button */}
          <button
            id="nav-watchlist-trigger"
            onClick={() => handleNavClick('watchlist')}
            className={`font-condensed text-sm tracking-wider uppercase flex items-center gap-1.5 px-3 py-1.5 border transition-colors cursor-pointer ${
              currentTab === 'watchlist'
                ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414] dark:border-[#F4F4F5]'
                : 'border-[#141414]/40 dark:border-[#3F3F46] text-[#141414] dark:text-[#F4F4F5] hover:border-[#141414] dark:hover:border-[#00A3FF] hover:bg-[#141414]/5 dark:hover:bg-[#18181B]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>WATCHLIST ({watchlistCount})</span>
          </button>

          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#141414]/40 dark:border-[#3F3F46] hover:border-[#141414] dark:hover:border-[#00A3FF] text-[#141414] dark:text-[#F4F4F5] hover:bg-[#141414]/5 dark:hover:bg-[#18181B] font-condensed text-xs tracking-wider uppercase transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark and light theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#141414]" />
                <span className="font-mono">DARK</span>
              </>
            )}
          </button>
        </nav>

        {/* Mobile / Tablet Controls */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Mobile Marvel Mode Trigger */}
          <button
            type="button"
            onClick={() => handleNavClick('marvel')}
            className={`px-2 py-1.5 border font-condensed text-xs font-bold uppercase transition-colors ${
              currentTab === 'marvel'
                ? 'bg-[#E62429] text-white border-[#E62429]'
                : 'bg-[#E62429]/10 text-[#E62429] dark:text-[#FF6B6B] border-[#E62429]/40'
            }`}
            aria-label="Marvel Mode"
          >
            MARVEL
          </button>

          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 border border-[#141414]/40 dark:border-[#3F3F46] text-[#141414] dark:text-[#F4F4F5] cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => handleNavClick('watchlist')}
            className={`p-2 border transition-colors ${
              currentTab === 'watchlist'
                ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414]'
                : 'border-[#141414]/40 dark:border-[#3F3F46] text-[#141414] dark:text-[#F4F4F5]'
            }`}
            aria-label="Watchlist"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavClick('search')}
            className={`p-2 border transition-colors ${
              currentTab === 'search'
                ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414]'
                : 'border-[#141414]/40 dark:border-[#3F3F46] text-[#141414] dark:text-[#F4F4F5]'
            }`}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-[#141414] dark:border-[#3F3F46] text-[#141414] dark:text-[#F4F4F5] cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-2 border-[#141414] dark:border-[#27272A] bg-[#E8E5DC] dark:bg-[#0B0B0D] px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left font-condensed text-lg tracking-wider uppercase py-2 px-3 border transition-colors ${
                  isActive
                    ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414] font-bold'
                    : 'border-[#141414]/20 dark:border-[#27272A] text-[#141414] dark:text-[#F4F4F5] hover:bg-[#141414]/5 dark:hover:bg-[#18181B]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => handleNavClick('marvel')}
            className={`w-full text-left font-condensed text-lg tracking-wider uppercase py-2 px-3 border transition-colors flex items-center gap-2 font-bold ${
              currentTab === 'marvel'
                ? 'bg-[#E62429] text-white border-[#E62429]'
                : 'border-[#E62429]/40 text-[#E62429] dark:text-[#FF6B6B] hover:bg-[#E62429]/10'
            }`}
          >
            <span className="w-2 h-2 bg-[#E62429] rounded-full inline-block" />
            <span>MARVEL MODE</span>
          </button>
          <button
            onClick={() => handleNavClick('watchlist')}
            className={`w-full text-left font-condensed text-lg tracking-wider uppercase py-2 px-3 border transition-colors flex items-center justify-between ${
              currentTab === 'watchlist'
                ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] dark:bg-[#F4F4F5] dark:text-[#141414] font-bold'
                : 'border-[#141414]/20 dark:border-[#27272A] text-[#141414] dark:text-[#F4F4F5] hover:bg-[#141414]/5 dark:hover:bg-[#18181B]'
            }`}
          >
            <span>WATCHLIST</span>
            <span className="font-mono text-sm font-bold">({watchlistCount})</span>
          </button>
        </div>
      )}
    </header>
  );
};
