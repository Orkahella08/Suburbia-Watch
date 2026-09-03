import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_COUNTRIES } from '../services/streamingAvailabilityService';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface CountrySelectorProps {
  selectedCountry: string; // Country code e.g. 'PH'
  onSelectCountry: (countryCode: string) => void;
  compact?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelectCountry,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCountry =
    SUPPORTED_COUNTRIES.find((c) => c.code.toUpperCase() === selectedCountry.toUpperCase()) ||
    SUPPORTED_COUNTRIES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        id="country-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border ${
          compact
            ? 'px-2.5 py-1 bg-[#141414]/5 border-[#141414]/30 hover:border-[#141414] text-[#141414]'
            : 'px-3 py-1.5 bg-[#FAF9F6] border-[#141414] text-[#141414] hover:bg-[#E8E5DC]'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Current Region: ${currentCountry.name}. Click to change region.`}
      >
        <Globe className="w-3.5 h-3.5 text-[#78716C]" />
        <span>{currentCountry.flag}</span>
        <span className="font-bold">{currentCountry.code}</span>
        <span className="hidden sm:inline text-[#78716C] truncate max-w-[100px]">
          ({currentCountry.name})
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="country-selector-dropdown"
          className="absolute right-0 mt-1 w-56 bg-[#FAF9F6] border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] z-50 py-1"
          role="listbox"
        >
          <div className="px-3 py-1.5 border-b border-[#141414]/15 text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
            SELECT STREAMING REGION
          </div>

          <div className="max-h-64 overflow-y-auto">
            {SUPPORTED_COUNTRIES.map((country) => {
              const isSelected = country.code.toUpperCase() === selectedCountry.toUpperCase();
              return (
                <button
                  key={country.code}
                  type="button"
                  id={`country-option-${country.code.toLowerCase()}`}
                  onClick={() => {
                    onSelectCountry(country.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left font-mono text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#141414] text-[#FAF9F6] font-bold'
                      : 'text-[#141414] hover:bg-[#E8E5DC]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="text-[10px] text-[#78716C] ml-1">({country.code})</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FAF9F6]" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 border-t border-[#141414]/15 text-[9px] font-mono text-[#78716C] leading-tight">
            Streaming rights and availability differ by country. Default: Philippines (PH).
          </div>
        </div>
      )}
    </div>
  );
};
