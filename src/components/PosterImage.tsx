import React, { useState, useEffect, useRef } from 'react';
import { Film, Loader2 } from 'lucide-react';
import { fetchImdbPosterById } from '../services/imdbService';

interface PosterImageProps {
  src?: string;
  initialPosterUrl?: string;
  fallbackUrl?: string;
  alt?: string;
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
  initialPosterUrl,
  fallbackUrl,
  alt,
  imdbId,
  title,
  year,
  className = '',
  imgClassName = '',
  aspectRatio = '2/3',
  loading = 'eager',
}) => {
  const targetPoster = src || initialPosterUrl || fallbackUrl || '';
  const altText = alt || title;
  const [currentSrc, setCurrentSrc] = useState<string>(targetPoster);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'unavailable'>('loading');
  const [attemptedFallback, setAttemptedFallback] = useState(false);
  const [retriedImdb, setRetriedImdb] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Sync with prop changes
  useEffect(() => {
    const nextPoster = src || initialPosterUrl || fallbackUrl || '';
    if (nextPoster) {
      setCurrentSrc(nextPoster);
      setAttemptedFallback(false);
      setRetriedImdb(false);
      setStatus('loading');
    } else if (imdbId) {
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
    } else {
      setStatus('unavailable');
    }
  }, [src, initialPosterUrl, fallbackUrl, imdbId]);

  // Check if image is already cached/complete immediately on mount or src change
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setStatus('loaded');
    }
  }, [currentSrc]);

  // Handle image load error: attempt fallbackUrl, then IMDb API lookup
  const handleError = async () => {
    // 1. Try fallbackUrl if different from currentSrc
    if (!attemptedFallback && fallbackUrl && fallbackUrl !== currentSrc) {
      setAttemptedFallback(true);
      setCurrentSrc(fallbackUrl);
      setStatus('loading');
      return;
    }

    // 2. Try fetching real official poster by IMDb ID
    if (!retriedImdb && imdbId) {
      setRetriedImdb(true);
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

    // 3. Dignified unavailable poster state
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
      className={`relative w-full h-full overflow-hidden bg-[#18181B] ${ratioClass} ${className}`}
      title={title}
    >
      {/* 1. Loading State Placeholder */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center bg-[#141416]/90 backdrop-blur-xs">
          <Film className="w-5 h-5 text-stone-500 mb-1.5 animate-pulse" />
          <span className="font-condensed text-xs text-stone-300 uppercase tracking-wider truncate max-w-[85%]">
            {title}
          </span>
          <span className="font-mono text-[9px] text-stone-500 uppercase mt-0.5">
            Loading Artwork...
          </span>
        </div>
      )}

      {/* 2. Poster Unavailable State (Authentic typography cinema card) */}
      {status === 'unavailable' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center bg-[#18181B] border border-stone-800 text-stone-300 select-none">
          <div className="p-2 border border-stone-700 bg-stone-900/80 rounded-xs mb-2">
            <Film className="w-5 h-5 text-stone-400" />
          </div>
          <span className="font-condensed font-bold text-xs uppercase tracking-tight text-stone-200 line-clamp-2 max-w-[95%]">
            {title}
          </span>
          {year && (
            <span className="font-mono text-[10px] text-stone-400 mt-1">
              ({year})
            </span>
          )}
          <div className="mt-2.5 px-2 py-0.5 border border-stone-800 bg-stone-900/60 text-[8px] font-mono text-stone-400 uppercase tracking-wider">
            Artwork Cataloged
          </div>
        </div>
      )}

      {/* 3. Real Official Artwork Image */}
      {currentSrc && status !== 'unavailable' && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={altText}
          loading={loading}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={() => setStatus('loaded')}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            status === 'loaded' ? 'opacity-100' : 'opacity-80'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
};
