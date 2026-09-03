import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MediaItem, Episode, WatchProgress, Season } from '../types';
import { extractImdbId, validateImdbId } from '../utils/imdb';
import { PosterImage } from './PosterImage';
import { fetchTvSeasonsAndEpisodes } from '../services/imdbService';
import { buildStreamImdbEmbedUrl, translateImdbToStream } from '../services/imdbWatchService';
import {
  X,
  Play,
  SkipForward,
  SkipBack,
  ChevronDown,
  Star,
  RefreshCw,
  ExternalLink,
  Info,
  Tv,
  ArrowLeft,
  Volume2,
  Subtitles,
  Share2,
  Check,
  ShieldCheck,
  Film,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface WatchPlayerProps {
  media: MediaItem;
  initialSeasonNumber?: number;
  initialEpisodeId?: string;
  onClose: () => void;
  onSelectActor?: (actorName: string) => void;
  onPlayMedia?: (item: MediaItem, seasonNum?: number, episodeId?: string) => void;
  onUpdateProgress?: (progress: WatchProgress) => void;
  savedProgress?: WatchProgress;
  onPlayNextMedia?: (nextMedia: MediaItem) => void;
  allMedia?: MediaItem[];
}

const AUDIO_LANGUAGES = ['Original Audio (Dolby 5.1)', 'English (Descriptive)', 'French', 'Spanish', 'German'];
const SUBTITLE_OPTIONS = ['Off', 'English [CC]', 'Spanish', 'French', 'German', 'Italian', 'Portuguese'];

export const WatchPlayer: React.FC<WatchPlayerProps> = ({
  media,
  initialSeasonNumber = 1,
  initialEpisodeId,
  onClose,
  onSelectActor,
  onPlayMedia,
  onUpdateProgress,
  savedProgress,
  allMedia = [],
}) => {
  const isTV = media.type === 'tv';
  const cleanImdb = extractImdbId(media.imdbId) || (validateImdbId(media.id) ? media.id : 'tt26443597');

  // Detect if running inside an iframe (like AI Studio preview)
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  // TV Seasons & Episode State
  const [seasons, setSeasons] = useState<Season[]>(() => {
    if (media.seasons && media.seasons.length > 0) return media.seasons;
    if (isTV) {
      return [
        {
          seasonNumber: 1,
          episodes: [
            {
              id: `${media.id}-s1e1`,
              episodeNumber: 1,
              seasonNumber: 1,
              title: 'Chapter 1: The Departure',
              synopsis: 'The series unfolds with an unprecedented incident that alters the course of history.',
              duration: '58 min',
              durationSeconds: 3480,
              thumbnailUrl: media.posterUrl,
              airDate: '2023-01-15',
            },
            {
              id: `${media.id}-s1e2`,
              episodeNumber: 2,
              seasonNumber: 1,
              title: 'Chapter 2: The Signal',
              synopsis: 'A clandestine frequency broadcast reveals an unspoken conspiracy beneath the surface.',
              duration: '52 min',
              durationSeconds: 3120,
              thumbnailUrl: media.backdropUrl || media.posterUrl,
              airDate: '2023-01-22',
            },
            {
              id: `${media.id}-s1e3`,
              episodeNumber: 3,
              seasonNumber: 1,
              title: 'Chapter 3: Crossing the Meridian',
              synopsis: 'The team confronts the realities of their expedition as communication lines severed.',
              duration: '61 min',
              durationSeconds: 3660,
              thumbnailUrl: media.posterUrl,
              airDate: '2023-01-29',
            },
          ],
        },
      ];
    }
    return [];
  });

  const [currentSeasonNum, setCurrentSeasonNum] = useState<number>(() => {
    if (savedProgress?.seasonNumber) return savedProgress.seasonNumber;
    return initialSeasonNumber;
  });

  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(() => {
    if (!isTV) return null;
    const targetSeason = seasons.find((s) => s.seasonNumber === currentSeasonNum) || seasons[0];
    if (!targetSeason || !targetSeason.episodes || targetSeason.episodes.length === 0) return null;

    if (savedProgress?.episodeNumber) {
      const ep = targetSeason.episodes.find((e) => e.episodeNumber === savedProgress.episodeNumber);
      if (ep) return ep;
    }

    if (initialEpisodeId) {
      const ep = targetSeason.episodes.find((e) => e.id === initialEpisodeId);
      if (ep) return ep;
    }

    return targetSeason.episodes[0];
  });

  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState<boolean>(false);

  // Fetch real episodes if TV and missing
  useEffect(() => {
    if (!isTV) return;
    if (media.seasons && media.seasons.length > 0) return;

    let isMounted = true;
    setIsLoadingEpisodes(true);

    fetchTvSeasonsAndEpisodes(cleanImdb, media.title)
      .then((fetchedSeasons) => {
        if (!isMounted) return;
        if (fetchedSeasons && fetchedSeasons.length > 0) {
          setSeasons(fetchedSeasons);
          const s1 = fetchedSeasons.find((s) => s.seasonNumber === currentSeasonNum) || fetchedSeasons[0];
          if (s1 && s1.episodes.length > 0 && !currentEpisode) {
            setCurrentEpisode(s1.episodes[0]);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load full IMDb seasons list:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingEpisodes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cleanImdb, isTV, media.title, media.seasons]);

  const currentSeason = useMemo(() => {
    return seasons.find((s) => s.seasonNumber === currentSeasonNum) || seasons[0];
  }, [seasons, currentSeasonNum]);

  // Next / Previous episode calculation with seamless cross-season boundary support
  const { prevEpisode, nextEpisode } = useMemo(() => {
    if (!isTV || !currentSeason || !currentEpisode || seasons.length === 0) {
      return { prevEpisode: null, nextEpisode: null };
    }
    const currentSeasonEps = currentSeason.episodes || [];
    const currentIdx = currentSeasonEps.findIndex((e) => e.id === currentEpisode.id);

    // Previous episode logic (same season or last episode of previous season)
    let prev: { episode: Episode; seasonNumber: number } | null = null;
    if (currentIdx > 0) {
      prev = { episode: currentSeasonEps[currentIdx - 1], seasonNumber: currentSeasonNum };
    } else {
      const prevSeason = seasons.find((s) => s.seasonNumber === currentSeasonNum - 1);
      if (prevSeason && prevSeason.episodes && prevSeason.episodes.length > 0) {
        prev = {
          episode: prevSeason.episodes[prevSeason.episodes.length - 1],
          seasonNumber: prevSeason.seasonNumber,
        };
      }
    }

    // Next episode logic (same season or first episode of next season)
    let next: { episode: Episode; seasonNumber: number } | null = null;
    if (currentIdx >= 0 && currentIdx < currentSeasonEps.length - 1) {
      next = { episode: currentSeasonEps[currentIdx + 1], seasonNumber: currentSeasonNum };
    } else {
      const nextSeason = seasons.find((s) => s.seasonNumber === currentSeasonNum + 1);
      if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
        next = { episode: nextSeason.episodes[0], seasonNumber: nextSeason.seasonNumber };
      }
    }

    return { prevEpisode: prev, nextEpisode: next };
  }, [isTV, currentSeason, currentEpisode, seasons, currentSeasonNum]);

  // Auto next episode configuration & countdown state
  const [autoNextEnabled, setAutoNextEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('suburbia_auto_next');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  const cancelAutoNext = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoNextCountdown(null);
  };

  const handleToggleAutoNext = () => {
    setAutoNextEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('suburbia_auto_next', String(next));
      } catch {}
      if (!next && autoNextCountdown !== null) {
        cancelAutoNext();
      }
      return next;
    });
  };

  const startAutoNextCountdown = (seconds = 8) => {
    if (!nextEpisode) return;
    cancelAutoNext();
    setAutoNextCountdown(seconds);

    countdownIntervalRef.current = setInterval(() => {
      setAutoNextCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          if (nextEpisode) {
            handleSelectEpisode(nextEpisode.episode, nextEpisode.seasonNumber);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clean up auto next timer on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Listen for video ended messages from player iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        if (
          data === 'ended' ||
          data?.event === 'ended' ||
          data?.type === 'ended' ||
          data?.status === 'ended' ||
          data?.action === 'ended' ||
          data?.event === 'video_ended' ||
          data?.data === 'ended'
        ) {
          if (isTV && autoNextEnabled && nextEpisode) {
            startAutoNextCountdown(8);
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isTV, autoNextEnabled, nextEpisode]);

  const handleSelectEpisode = (ep: Episode, seasonNum: number) => {
    cancelAutoNext();
    setCurrentSeasonNum(seasonNum);
    setCurrentEpisode(ep);
    setPlayerLoading(true);

    onUpdateProgress?.({
      mediaId: media.id,
      mediaTitle: media.title,
      type: 'tv',
      posterUrl: media.posterUrl,
      seasonNumber: seasonNum,
      episodeNumber: ep.episodeNumber,
      progressSeconds: 60,
      totalSeconds: ep.durationSeconds || 3600,
      formattedTime: ep.duration,
      updatedAt: Date.now(),
    });
  };

  // Audio & Subtitles
  const [audioLang, setAudioLang] = useState<string>(AUDIO_LANGUAGES[0]);
  const [subtitleLang, setSubtitleLang] = useState<string>(SUBTITLE_OPTIONS[0]);

  // Player state
  const [playerLoading, setPlayerLoading] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Single unified stream source: streamimdb.ru (e.g. https://streamimdb.ru/embed/tv/tt6226232)
  const inAppStreamUrl = useMemo(() => {
    if (isTV) {
      if (currentSeasonNum > 1 || (currentEpisode && currentEpisode.episodeNumber > 1)) {
        return `https://streamimdb.ru/embed/tv/${cleanImdb}/${currentSeasonNum}/${currentEpisode?.episodeNumber || 1}`;
      }
      return `https://streamimdb.ru/embed/tv/${cleanImdb}`;
    }
    return `https://streamimdb.ru/embed/movie/${cleanImdb}`;
  }, [cleanImdb, isTV, currentSeasonNum, currentEpisode?.episodeNumber]);

  // Whenever stream URL changes, trigger loading state
  useEffect(() => {
    setPlayerLoading(true);
  }, [inAppStreamUrl]);

  const handleReloadPlayer = () => {
    setPlayerLoading(true);
    if (iframeRef.current) {
      const current = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = current;
        }
      }, 80);
    }
  };

  const handleFullscreen = () => {
    const el = document.getElementById('video-player-container');
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        el.requestFullscreen().catch(() => {});
      }
    }
  };

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${media.title} (${media.releaseYear || ''})`);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch {}
  };

  // Related titles
  const relatedTitles = useMemo(() => {
    return allMedia
      .filter((m) => m.id !== media.id && m.genres.some((g) => media.genres.includes(g)))
      .slice(0, 6);
  }, [allMedia, media]);

  return (
    <div
      id="watch-player-modal"
      className="fixed inset-0 z-50 bg-[#0B0B0C] text-[#FAF9F6] overflow-y-auto flex flex-col font-sans"
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B0B0C]/95 backdrop-blur-md border-b border-[#27272A] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            id="back-to-catalog-btn"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] border border-[#3F3F46] hover:border-[#00A3FF] hover:text-[#00A3FF] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RETURN TO CATALOGUE</span>
          </button>

          <div className="min-w-0">
            <h2 className="font-condensed text-base sm:text-lg font-bold uppercase tracking-wide text-[#FAF9F6] truncate">
              {media.title}
            </h2>
            {isTV && currentEpisode && (
              <p className="font-mono text-xs text-[#00A3FF] truncate">
                S{currentSeasonNum}·E{currentEpisode.episodeNumber}: {currentEpisode.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            id="share-title-btn"
            onClick={handleShare}
            className="p-2 bg-[#18181B] border border-[#3F3F46] hover:border-[#00A3FF] text-[#A8A29E] hover:text-[#00A3FF] transition-colors cursor-pointer"
            title="Copy title"
          >
            {copiedNotification ? (
              <Check className="w-4 h-4 text-[#10B981]" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            id="close-player-btn"
            onClick={onClose}
            className="p-2 bg-[#18181B] border border-[#3F3F46] hover:border-[#EF4444] text-[#A8A29E] hover:text-[#EF4444] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Player Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6">
        
        {/* Player Stream Toolbar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 bg-[#141416] border border-[#27272A] p-2 sm:px-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
              STREAM SOURCE:
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-mono uppercase bg-[#18181B] text-[#00A3FF] border border-[#00A3FF]/40 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                StreamIMDb
              </span>
              <span className="text-[11px] font-mono text-[#71717A] hidden sm:inline">
                {isTV ? `streamimdb.ru/embed/tv/${cleanImdb}` : `streamimdb.ru/embed/movie/${cleanImdb}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#A8A29E]">
            <button
              type="button"
              id="reload-player-stream-btn"
              onClick={handleReloadPlayer}
              className="px-2.5 py-1.5 bg-[#1F1F23] border border-[#3F3F46] hover:border-[#71717A] hover:text-[#FAF9F6] transition-colors flex items-center gap-1.5 cursor-pointer text-[11px] uppercase tracking-wider"
              title="Reload current stream player"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reload</span>
            </button>

            <button
              type="button"
              id="fullscreen-player-btn"
              onClick={handleFullscreen}
              className="px-2.5 py-1.5 bg-[#1F1F23] border border-[#3F3F46] hover:border-[#71717A] hover:text-[#FAF9F6] transition-colors flex items-center gap-1.5 cursor-pointer text-[11px] uppercase tracking-wider"
              title="Toggle Fullscreen"
            >
              <span>Fullscreen</span>
            </button>
          </div>
        </div>

        {/* 1. 16:9 RESPONSIVE VIDEO PLAYER CONTAINER */}
        <div
          id="video-player-container"
          className="relative w-full aspect-video bg-black border-2 border-[#27272A] shadow-2xl overflow-hidden"
        >
          <iframe
            ref={iframeRef}
            id="official-player-frame"
            src={inAppStreamUrl}
            title={media.title}
            className="w-full h-full border-0 bg-black"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
            allowFullScreen
            referrerPolicy="origin"
            onLoad={() => setPlayerLoading(false)}
          />

          {/* Floating Player Status Pill */}
          <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2 bg-[#0B0B0C]/85 backdrop-blur-sm border border-[#27272A] px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-[#FAF9F6]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>
              {isTV && currentEpisode
                ? `S${currentSeasonNum.toString().padStart(2, '0')}E${currentEpisode.episodeNumber.toString().padStart(2, '0')} · 1080p HD`
                : '1080p HD Stream'}
            </span>
          </div>

          {/* Player Loading Overlay */}
          {playerLoading && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-10">
              <RefreshCw className="w-6 h-6 text-[#00A3FF] animate-spin" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#A8A29E]">
                CONNECTING DIRECT STREAM...
              </span>
            </div>
          )}

          {/* AUTO-NEXT EPISODE FLOATING COUNTDOWN HUD */}
          {autoNextCountdown !== null && nextEpisode && (
            <div
              id="auto-next-episode-hud"
              className="absolute inset-x-4 bottom-4 z-30 sm:right-6 sm:left-auto sm:max-w-md bg-[#0D0D10]/95 backdrop-blur-md border-2 border-[#00A3FF] p-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                  <span className="font-mono text-xs text-[#00A3FF] font-bold uppercase tracking-wider">
                    AUTO NEXT IN {autoNextCountdown} SECONDS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={cancelAutoNext}
                  className="text-[#A8A29E] hover:text-[#FAF9F6] p-1 cursor-pointer"
                  title="Cancel auto-next countdown"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm font-condensed font-bold uppercase text-white truncate">
                S{nextEpisode.seasonNumber.toString().padStart(2, '0')}·E{nextEpisode.episode.episodeNumber.toString().padStart(2, '0')} — {nextEpisode.episode.title}
              </div>
              <p className="font-serif-editorial text-xs text-[#A8A29E] line-clamp-1 mt-0.5">
                {nextEpisode.episode.synopsis}
              </p>

              {/* Countdown Progress Bar */}
              <div className="w-full bg-[#27272A] h-1.5 mt-2.5 overflow-hidden">
                <div
                  className="bg-[#00A3FF] h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((8 - (autoNextCountdown || 0)) / 8) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    cancelAutoNext();
                    handleSelectEpisode(nextEpisode.episode, nextEpisode.seasonNumber);
                  }}
                  className="flex-1 bg-[#00A3FF] hover:bg-[#38BDF8] text-black font-condensed font-bold py-2 px-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PLAY EPISODE NOW</span>
                </button>
                <button
                  type="button"
                  onClick={cancelAutoNext}
                  className="bg-[#27272A] hover:bg-[#3F3F46] text-[#FAF9F6] font-mono py-2 px-3 text-xs uppercase cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Playback Status HUD */}
        <div
          id="imdbwatch-translation-hud"
          className="mt-3 bg-[#18181B] border border-[#27272A] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="px-2 py-0.5 bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40 text-[10px] uppercase font-bold tracking-wider shrink-0">
              STREAM STATUS
            </span>
            <span className="text-[#A8A29E] truncate text-[11px]">
              <span className="text-white font-bold">{media.title}</span>
              <span className="mx-1.5 text-[#52525B]">·</span>
              <span className="text-[#38BDF8]">{isTV && currentEpisode ? `Season ${currentSeasonNum}, Episode ${currentEpisode.episodeNumber}` : 'Full Movie'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 text-[#10B981] text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              STREAM ACTIVE
            </span>
          </div>
        </div>

        {/* 2. TV EPISODE SELECTOR & CONTROLS */}
        {isTV && (
          <div id="tv-controls-section" className="mt-4 bg-[#141416] border border-[#27272A] p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#27272A] pb-3 mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                  SEASON:
                </span>
                {seasons.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {seasons.map((s) => (
                      <button
                        key={s.seasonNumber}
                        type="button"
                        id={`season-tab-${s.seasonNumber}`}
                        onClick={() => {
                          setCurrentSeasonNum(s.seasonNumber);
                          if (s.episodes.length > 0) {
                            setCurrentEpisode(s.episodes[0]);
                          }
                        }}
                        className={`px-3 py-1 text-xs font-mono uppercase border transition-colors cursor-pointer ${
                          currentSeasonNum === s.seasonNumber
                            ? 'bg-[#00A3FF] text-black font-bold border-[#00A3FF]'
                            : 'bg-[#18181B] text-[#A8A29E] border-[#3F3F46] hover:text-[#FAF9F6]'
                        }`}
                      >
                        Season {s.seasonNumber}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="font-mono text-xs text-[#A8A29E]">Season 1</span>
                )}
              </div>

              {/* Prev, Next & Auto-Next Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Auto Next Toggle */}
                <button
                  type="button"
                  id="auto-next-toggle-btn"
                  onClick={handleToggleAutoNext}
                  className={`px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    autoNextEnabled
                      ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                      : 'border-[#3F3F46] bg-[#18181B] text-[#71717A]'
                  }`}
                  title="Toggle automatic playback of subsequent episodes"
                >
                  <span className={`w-2 h-2 rounded-full ${autoNextEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                  <span>AUTO NEXT: {autoNextEnabled ? 'ON' : 'OFF'}</span>
                </button>

                {nextEpisode && (
                  <button
                    type="button"
                    onClick={() => startAutoNextCountdown(5)}
                    className="px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider border border-[#00A3FF]/40 bg-[#00A3FF]/10 text-[#38BDF8] hover:bg-[#00A3FF]/20 transition-colors cursor-pointer"
                    title="Simulate end-of-episode auto next countdown"
                  >
                    TRIGGER AUTO NEXT (5S)
                  </button>
                )}

                <button
                  type="button"
                  id="prev-episode-btn"
                  onClick={() => prevEpisode && handleSelectEpisode(prevEpisode.episode, prevEpisode.seasonNumber)}
                  disabled={!prevEpisode}
                  className={`px-3 py-1.5 text-xs font-condensed uppercase tracking-wider border flex items-center gap-1.5 transition-colors ${
                    prevEpisode
                      ? 'border-[#3F3F46] text-[#FAF9F6] hover:border-[#00A3FF] hover:text-[#00A3FF] cursor-pointer bg-[#18181B]'
                      : 'border-[#27272A] text-[#52525B] cursor-not-allowed bg-transparent'
                  }`}
                  title={prevEpisode ? `Previous: S${prevEpisode.seasonNumber}·E${prevEpisode.episode.episodeNumber}` : 'No previous episode'}
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>PREVIOUS</span>
                </button>

                <button
                  type="button"
                  id="next-episode-btn"
                  onClick={() => nextEpisode && handleSelectEpisode(nextEpisode.episode, nextEpisode.seasonNumber)}
                  disabled={!nextEpisode}
                  className={`px-3 py-1.5 text-xs font-condensed uppercase tracking-wider border flex items-center gap-1.5 transition-colors ${
                    nextEpisode
                      ? 'border-[#00A3FF] bg-[#00A3FF] text-black font-bold hover:bg-[#38BDF8] cursor-pointer'
                      : 'border-[#27272A] text-[#52525B] cursor-not-allowed bg-transparent'
                  }`}
                  title={nextEpisode ? `Next: S${nextEpisode.seasonNumber}·E${nextEpisode.episode.episodeNumber}` : 'No next episode'}
                >
                  <span>NEXT EPISODE</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Real Episodes Grid */}
            {isLoadingEpisodes ? (
              <div className="py-8 text-center text-[#A8A29E] font-mono text-xs">
                <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2" />
                Retrieving verified episode catalog from IMDb records...
              </div>
            ) : currentSeason && currentSeason.episodes.length > 0 ? (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block mb-2">
                  SEASON {currentSeasonNum} EPISODES ({currentSeason.episodes.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {currentSeason.episodes.map((ep) => {
                    const isSelected = currentEpisode?.id === ep.id;
                    return (
                      <button
                        key={ep.id}
                        type="button"
                        id={`ep-card-${ep.episodeNumber}`}
                        onClick={() => handleSelectEpisode(ep, currentSeasonNum)}
                        className={`text-left p-2.5 border transition-all cursor-pointer flex gap-2.5 ${
                          isSelected
                            ? 'bg-[#1F1F24] border-[#00A3FF] shadow-[2px_2px_0px_0px_rgba(0,163,255,1)]'
                            : 'bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]'
                        }`}
                      >
                        <div className="w-16 h-10 bg-[#27272A] shrink-0 overflow-hidden relative flex items-center justify-center">
                          {ep.thumbnailUrl ? (
                            <img
                              src={ep.thumbnailUrl}
                              alt={ep.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Tv className="w-4 h-4 text-[#71717A]" />
                          )}
                          <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] font-mono px-1 text-[#FAF9F6]">
                            E{ep.episodeNumber}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-condensed text-xs font-bold uppercase truncate text-[#FAF9F6]">
                            {ep.episodeNumber}. {ep.title}
                          </h4>
                          <p className="font-mono text-[10px] text-[#71717A] truncate">
                            {ep.duration || '45m'} {ep.airDate ? `· ${ep.airDate}` : ''}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-[#71717A] font-mono text-xs">
                Season 1 ready for stream playback.
              </div>
            )}
          </div>
        )}

        {/* 3. AUDIO & SUBTITLES SELECTION */}
        <div
          id="audio-subtitles-section"
          className="mt-4 bg-[#141416] border border-[#27272A] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#00A3FF]" />
              <span className="text-[#71717A] uppercase">AUDIO:</span>
              <select
                id="audio-lang-select"
                value={audioLang}
                onChange={(e) => setAudioLang(e.target.value)}
                className="bg-[#18181B] border border-[#3F3F46] text-[#FAF9F6] px-2.5 py-1 text-xs font-mono uppercase focus:outline-none focus:border-[#00A3FF]"
              >
                {AUDIO_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-[#00A3FF]" />
              <span className="text-[#71717A] uppercase">SUBTITLES:</span>
              <select
                id="subtitle-lang-select"
                value={subtitleLang}
                onChange={(e) => setSubtitleLang(e.target.value)}
                className="bg-[#18181B] border border-[#3F3F46] text-[#FAF9F6] px-2.5 py-1 text-xs font-mono uppercase focus:outline-none focus:border-[#00A3FF]"
              >
                {SUBTITLE_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] text-[#71717A] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00A3FF]" />
            <span>PLAYER.IMDB.SU STREAM ENGINE</span>
          </div>
        </div>

        {/* 4. TITLE METADATA & CAST SECTION */}
        <div id="title-metadata-section" className="mt-6 bg-[#141416] border border-[#27272A] p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 sm:w-44 shrink-0 mx-auto md:mx-0">
              <PosterImage
                title={media.title}
                imdbId={media.imdbId}
                initialPosterUrl={media.posterUrl}
                className="w-full aspect-[2/3] object-cover border-2 border-[#27272A] shadow-md"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Type, Year, Runtime, IMDb Rating Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-[#00A3FF] text-black font-mono text-[10px] font-bold uppercase tracking-wider">
                  {isTV ? 'TV SERIES' : 'FEATURE FILM'}
                </span>
                <span className="px-2 py-0.5 bg-[#18181B] border border-[#3F3F46] font-mono text-xs text-[#A8A29E]">
                  {media.releaseYear}
                </span>
                {media.duration && (
                  <span className="px-2 py-0.5 bg-[#18181B] border border-[#3F3F46] font-mono text-xs text-[#A8A29E]">
                    {media.duration}
                  </span>
                )}
                {media.maturityRating && (
                  <span className="px-2 py-0.5 bg-[#18181B] border border-[#3F3F46] font-mono text-xs text-[#A8A29E]">
                    {media.maturityRating}
                  </span>
                )}
                <div className="flex items-center gap-1 bg-[#EAB308]/15 border border-[#EAB308]/40 px-2 py-0.5 text-xs font-mono font-bold text-[#EAB308]">
                  <Star className="w-3 h-3 fill-current" />
                  <span>IMDb {media.imdbRating} / 10</span>
                </div>
                {cleanImdb && (
                  <a
                    href={`https://www.imdb.com/title/${cleanImdb}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-[#00A3FF] hover:underline flex items-center gap-1"
                  >
                    <span>{cleanImdb}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <h1 className="font-condensed text-2xl sm:text-4xl font-bold uppercase tracking-wide text-[#FAF9F6] mb-2">
                {media.title}
              </h1>

              {media.tagline && (
                <p className="font-serif-editorial italic text-sm text-[#A8A29E] mb-3">
                  "{media.tagline}"
                </p>
              )}

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {media.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-0.5 bg-[#18181B] border border-[#27272A] text-[#A8A29E] font-mono text-[11px] uppercase tracking-wider"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Plot Description */}
              <p className="font-serif-editorial text-base text-[#D4D4D8] leading-relaxed mb-6">
                {media.synopsis}
              </p>

              {/* Credits & Cast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono border-t border-[#27272A] pt-4">
                <div>
                  <span className="text-[#71717A] uppercase tracking-widest block mb-1">
                    DIRECTOR:
                  </span>
                  <span className="text-[#FAF9F6]">{media.director || 'Acclaimed Director'}</span>
                </div>
                <div>
                  <span className="text-[#71717A] uppercase tracking-widest block mb-1">
                    WRITER:
                  </span>
                  <span className="text-[#FAF9F6]">{media.writer || 'Original Screenplay'}</span>
                </div>
                {media.cast && media.cast.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-[#71717A] uppercase tracking-widest block mb-1.5">
                      STARRING CAST:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {media.cast.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectActor?.(c.name);
                          }}
                          className="px-2.5 py-1 bg-[#18181B] border border-[#3F3F46] hover:border-[#00A3FF] text-[#FAF9F6] text-xs font-mono transition-colors cursor-pointer"
                        >
                          <span className="font-bold">{c.name}</span>
                          {c.role && <span className="text-[#71717A] ml-1">as {c.role}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 5. STREAM ENGINE SPECIFICATIONS */}
        <div id="stream-source-specs" className="mt-6 bg-[#141416] border border-[#27272A] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00A3FF]" />
              <div>
                <h3 className="font-condensed text-xl font-bold uppercase tracking-wider text-[#FAF9F6]">
                  STREAM ENGINE SPECIFICATIONS
                </h3>
                <p className="font-mono text-xs text-[#71717A] mt-0.5">
                  Direct in-app playback engine configuration for this title
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase px-2.5 py-1 bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 font-bold self-start sm:self-auto">
              HIGH DEFINITION STREAM
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-[#18181B] border border-[#27272A]">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">ACTIVE ENGINE</span>
              <span className="font-mono text-sm text-white font-bold">
                StreamIMDb
              </span>
            </div>
            <div className="p-3 bg-[#18181B] border border-[#27272A]">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">RESOLUTION</span>
              <span className="font-mono text-sm text-white font-bold">1080p Full HD</span>
            </div>
            <div className="p-3 bg-[#18181B] border border-[#27272A]">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">STREAM SOURCE</span>
              <span className="font-mono text-sm text-[#34D399] font-bold">streamimdb.ru</span>
            </div>
            <div className="p-3 bg-[#18181B] border border-[#27272A]">
              <span className="text-[10px] font-mono text-[#71717A] uppercase block">PLAYBACK MODE</span>
              <span className="font-mono text-sm text-[#00A3FF] font-bold">Integrated Native Player</span>
            </div>
          </div>
        </div>

        {/* 6. RELATED TITLES SECTION */}
        {relatedTitles.length > 0 && (
          <div id="related-titles-section" className="mt-8 border-t border-[#27272A] pt-6">
            <h3 className="font-condensed text-xl font-bold uppercase tracking-wider text-[#FAF9F6] mb-4">
              MORE TITLES AVAILABLE TO STREAM
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {relatedTitles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  id={`related-title-${item.id}`}
                  onClick={() => {
                    onPlayMedia?.(item);
                  }}
                  className="text-left group cursor-pointer focus:outline-none"
                >
                  <div className="aspect-[2/3] w-full relative overflow-hidden border border-[#27272A] group-hover:border-[#00A3FF] transition-colors bg-[#18181B]">
                    <PosterImage
                      title={item.title}
                      imdbId={item.imdbId}
                      initialPosterUrl={item.posterUrl}
                      fallbackUrl={item.backdropUrl}
                      year={item.releaseYear}
                      loading="eager"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-condensed text-xs font-bold uppercase text-[#FAF9F6] truncate mt-1.5 group-hover:text-[#00A3FF] transition-colors">
                    {item.title}
                  </h4>
                  <div className="font-mono text-[10px] text-[#71717A]">
                    {item.releaseYear} · IMDb {item.imdbRating}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
