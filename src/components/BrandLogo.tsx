import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const textSizes = {
    sm: 'text-2xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl',
  };

  return (
    <div className={`flex flex-col select-none leading-none ${className}`}>
      <span
        className={`font-condensed font-bold tracking-tight text-[#141414] uppercase ${textSizes[size]}`}
      >
        SUBURBIA WATCH
      </span>
      {showTagline && (
        <span className="text-[10px] font-mono tracking-widest text-[#78716C] uppercase mt-1">
          A Curated Collection of Cinema
        </span>
      )}
    </div>
  );
};
