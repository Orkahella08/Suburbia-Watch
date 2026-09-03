import React, { useState, useEffect } from 'react';
import { Film, Loader2 } from 'lucide-react';
import { fetchImdbPosterById } from '../services/imdbService';

interface PosterImageProps {
  src?: string;
  alt: string;
  imdbId?: string;
  title: string;
  year?: number | string;
  className?: string;
  imgClassName?: string;
  aspectRatio?: '2/3' | '16/9' | 'auto';
  loading?: 'lazy' | 'eager';
}

export const PosterImage: React.FC<PosterImageProps> = ({
  src,
  alt,
  imdbId,
  title,
  year,
  className = '',
  imgClassName = '',
  aspectRatio = '2/3',
  loading = 'lazy',
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src || '');
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'unavailable'>(() => {
    return src ? 'loading' : 'loading';
  });
  const [retried, setRetried] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    if (src && src !== currentSrc) {
      setCurrentSrc(src);
      setStatus('loading');
      setRetried(false);
    } else if (!src && imdbId) {
      // No initial poster provided, attempt to fetch directly using IMDb ID
      let isMounted = true;
      setStatus('loading');
      fetchImdbPosterById(imdbId).then((realPoster) => {
        if (!isMounted) return;
        if (realPoster) {
          setCurrentSrc(realPoster);
          setStatus('loading');
        } else {
          setStatus('unavailable');
        }
      });
      return () => {
        isMounted = false;
      };
    } else if (!src && !imdbId) {
      setStatus('unavailable');
    }
  }, [src, imdbId]);

  // Handle image load error: attempt to fetch real poster via IMDb ID
  const handleError = async () => {
    if (!retried && imdbId) {
      setRetried(true);
      setStatus('loading');
      try {
        const fallbackPoster = await fetchImdbPosterById(imdbId);
        if (fallbackPoster && fallbackPoster !== currentSrc) {
          setCurrentSrc(fallbackPoster);
          return;
        }
      } catch {
        // Fallback fetch failed
      }
    }
    // If no legitimate poster can be retrieved, show authentic unavailable state
    setStatus('unavailable');
  };

  const ratioClass =
    aspectRatio === '2/3'
      ? 'aspect-[2/3]'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : '';

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#141414] ${ratioClass} ${className}`}
      title={title}
    >
      {/* 1. Loading State */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center bg-[#141414] animate-pulse">
          <Film className="w-6 h-6 text-stone-600 mb-2 animate-spin-slow" />
          <span className="font-mono text-[10px] text-stone-400 uppercase tracking-wider truncate max-w-[90%]">
            {title}
          </span>
          <span className="font-mono text-[9px] text-stone-600 uppercase mt-0.5">
            Loading Artwork...
          </span>
        </div>
      )}

      {/* 2. Poster Unavailable State (Clean, dignified, NO fake images) */}
      {status === 'unavailable' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-[#141414] border border-stone-800 text-stone-300 select-none">
          <div className="p-2 border border-stone-800 bg-stone-900/60 rounded-sm mb-2">
            <Film className="w-5 h-5 text-stone-500" />
          </div>
          <span className="font-condensed font-bold text-xs sm:text-sm uppercase tracking-tight text-stone-200 line-clamp-2 max-w-[95%]">
            {title}
          </span>
          {year && (
            <span className="font-mono text-[10px] text-stone-500 mt-1">
              ({year})
            </span>
          )}
          <div className="mt-3 px-2 py-0.5 border border-stone-800 bg-stone-900/40 text-[9px] font-mono text-stone-400 uppercase tracking-wider">
            Poster Unavailable
          </div>
        </div>
      )}

      {/* 3. Real Official Artwork Image */}
      {currentSrc && status !== 'unavailable' && (
        <img
          src={currentSrc}
          alt={alt || title}
          loading={loading}
          referrerPolicy="no-referrer"
          onLoad={() => setStatus('loaded')}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
};
