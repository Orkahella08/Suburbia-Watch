import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MediaItem, Episode, WatchProgress } from '../types';
import { extractImdbId, validateImdbId, buildImdbUrl } from '../utils/imdb';
import { PlaybackManager, defaultPlaybackManager } from '../services/playback/PlaybackManager';
import { PlaybackProvider } from '../services/playback/PlaybackProvider';
import { AdSandbox } from './AdSandbox';
import {
  X,
  Play,
  SkipForward,
  SkipBack,
  ChevronDown,
  Star,
  RefreshCw,
  AlertCircle,
  Check,
  Info,
  Tv,
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
  playbackManager?: PlaybackManager;
}

type PlayerState = 'loading' | 'ready' | 'error' | 'source_failed';

const AUTO_NEXT_KEY = 'suburbia_auto_next_preference';

function getInitialAutoNext(): boolean {
  try {
    const saved = localStorage.getItem(AUTO_NEXT_KEY);
    return saved !== null ? saved === 'true' : true;
  } catch {
    return true;
  }
}

function saveAutoNextPreference(val: boolean) {
  try {
    localStorage.setItem(AUTO_NEXT_KEY, String(val));
  } catch {
    // Ignore localStorage write error
  }
}

export const WatchPlayer: React.FC<WatchPlayerProps> = ({
  media,
  initialSeasonNumber = 1,
  initialEpisodeId,
  onClose,
  onSelectActor,
  onPlayMedia,
  allMedia = [],
  playbackManager = defaultPlaybackManager,
}) => {
  const isTV = media.type === 'tv';

  // Episode Selection State
  const [currentSeasonNum, setCurrentSeasonNum] = useState<number>(initialSeasonNumber);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [autoNext, setAutoNext] = useState<boolean>(getInitialAutoNext);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);

  // Playback Provider State & Dynamic Sources
  const [selectedProvider, setSelectedProvider] = useState<PlaybackProvider | null>(null);
  const [failedProviders, setFailedProviders] = useState<string[]>([]);

  // UI Control Values
  const [voiceLanguage, setVoiceLanguage] = useState('Original Language');
  const [subtitlesOption, setSubtitlesOption] = useState('Auto-Load English');

  // Player Lifecycle & Loading State (Strictly user-facing, no technical leaks)
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [showDebug, setShowDebug] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timeoutRef = useRef<any>(null);

  // Current Season Object
  const currentSeason = useMemo(() => {
    if (!isTV || !media.seasons || media.seasons.length === 0) return null;
    return (
      media.seasons.find((s) => s.seasonNumber === currentSeasonNum) ||
      media.seasons[0]
    );
  }, [isTV, media.seasons, currentSeasonNum]);

  // Sync initial episode or default first episode
  useEffect(() => {
    if (!isTV || !currentSeason) {
      setCurrentEpisode(null);
      return;
    }
    if (initialEpisodeId) {
      const matched = currentSeason.episodes.find((e) => e.id === initialEpisodeId);
      if (matched) {
        setCurrentEpisode(matched);
        return;
      }
    }
    if (currentSeason.episodes.length > 0) {
      setCurrentEpisode(currentSeason.episodes[0]);
    }
  }, [isTV, currentSeason, initialEpisodeId]);

  // Determine Active IMDb ID
  const activeImdbId = useMemo(() => {
    if (isTV && currentEpisode && currentEpisode.imdbId) {
      const extracted = extractImdbId(currentEpisode.imdbId);
      if (extracted && validateImdbId(extracted)) {
        return extracted;
      }
    }
    return extractImdbId(media.imdbId || media.videoUrl) || media.imdbId || '';
  }, [isTV, currentEpisode, media.imdbId, media.videoUrl]);

  const isValidImdbId = useMemo(() => {
    return validateImdbId(activeImdbId);
  }, [activeImdbId]);

  // Available Playback Providers dynamically queried
  const availableProviders = useMemo(() => {
    return playbackManager.getAvailableProviders(media, currentEpisode);
  }, [playbackManager, media, currentEpisode]);

  // Initialize or fallback selected provider
  useEffect(() => {
    if (availableProviders.length === 0) {
      setSelectedProvider(null);
      return;
    }
    // Select first non-failed provider, or first available
    const unfailed = availableProviders.find((p) => !failedProviders.includes(p.getName()));
    setSelectedProvider(unfailed || availableProviders[0]);
  }, [availableProviders, failedProviders]);

  // Active Playback URL
  const playbackUrl = useMemo(() => {
    if (!selectedProvider || !isValidImdbId) return null;
    return selectedProvider.getPlaybackUrl(media, currentEpisode);
  }, [selectedProvider, isValidImdbId, media, currentEpisode]);

  // Attempt playback for a provider
  const tryPlaybackSource = (provider: PlaybackProvider | null) => {
    if (!provider) {
      setPlayerState('source_failed');
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isValidImdbId) {
      setPlayerState('error');
      return;
    }

    setPlayerState('loading');

    // Timeout safety for embedded player: if iframe fails to load or triggers CSP/X-Frame-Options
    timeoutRef.current = setTimeout(() => {
      setPlayerState((prev) => {
        if (prev === 'loading') {
          // Mark this source as unavailable for embedding
          setFailedProviders((fp) =>
            fp.includes(provider.getName()) ? fp : [...fp, provider.getName()]
          );
          return 'source_failed';
        }
        return prev;
      });
    }, 6000);
  };

  // Trigger playback when URL or provider changes
  useEffect(() => {
    if (!playbackUrl || !isValidImdbId) {
      setPlayerState('error');
      return;
    }
    tryPlaybackSource(selectedProvider);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [playbackUrl, isValidImdbId]);

  const handleIframeLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPlayerState('ready');
  };

  const handleIframeError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (selectedProvider) {
      setFailedProviders((fp) =>
        fp.includes(selectedProvider.getName()) ? fp : [...fp, selectedProvider.getName()]
      );
    }
    setPlayerState('source_failed');
  };

  const handleSourceChange = (providerName: string) => {
    const match = availableProviders.find((p) => p.getName() === providerName);
    if (!match) return;
    setSelectedProvider(match);
    tryPlaybackSource(match);
  };

  const handleRetryPlayback = () => {
    if (selectedProvider) {
      tryPlaybackSource(selectedProvider);
    }
  };

  // TV Serial Next / Previous navigation
  const nextEpisode = useMemo(() => {
    if (!isTV || !currentSeason || !currentEpisode) return null;
    const episodes = currentSeason.episodes;
    const idx = episodes.findIndex((e) => e.id === currentEpisode.id);
    if (idx !== -1 && idx < episodes.length - 1) {
      return episodes[idx + 1];
    }
    if (media.seasons) {
      const nextS = media.seasons.find((s) => s.seasonNumber === currentSeasonNum + 1);
      if (nextS && nextS.episodes.length > 0) {
        return nextS.episodes[0];
      }
    }
    return null;
  }, [isTV, currentSeason, currentEpisode, media.seasons, currentSeasonNum]);

  const prevEpisode = useMemo(() => {
    if (!isTV || !currentSeason || !currentEpisode) return null;
    const episodes = currentSeason.episodes;
    const idx = episodes.findIndex((e) => e.id === currentEpisode.id);
    if (idx > 0) {
      return episodes[idx - 1];
    }
    if (media.seasons && currentSeasonNum > 1) {
      const prevS = media.seasons.find((s) => s.seasonNumber === currentSeasonNum - 1);
      if (prevS && prevS.episodes.length > 0) {
        return prevS.episodes[prevS.episodes.length - 1];
      }
    }
    return null;
  }, [isTV, currentSeason, currentEpisode, media.seasons, currentSeasonNum]);

  const handleSelectEpisode = (ep: Episode, seasonNum: number) => {
    setCurrentSeasonNum(seasonNum);
    setCurrentEpisode(ep);
    setShowEpisodeSelector(false);
  };

  const handleToggleAutoNext = () => {
    const nextVal = !autoNext;
    setAutoNext(nextVal);
    saveAutoNextPreference(nextVal);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Clean-up upon unmount: destroy iframe, cancel timers, reset state
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (iframeRef.current) {
        iframeRef.current.src = 'about:blank';
      }
    };
  }, []);

  return (
    <div
      id="suburbia-watch-player-modal"
      className="fixed inset-0 z-50 bg-[#0B0B0C] text-[#FAF9F6] overflow-y-auto flex flex-col font-sans"
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0B0B0C]/95 backdrop-blur-md border-b border-[#27272A] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-2.5 h-2.5 bg-[#00A3FF] rounded-full animate-pulse shrink-0" />
          <div className="min-w-0">
            <h2 className="font-condensed text-lg sm:text-xl font-bold uppercase tracking-wider text-[#FAF9F6] truncate">
              {media.title}
            </h2>
            {isTV && currentEpisode && (
              <div className="text-xs font-mono text-[#A8A29E] truncate">
                Season {currentSeasonNum} · Episode {currentEpisode.episodeNumber}: {currentEpisode.title}
              </div>
            )}
          </div>
        </div>

        {/* Right: Close Button [ X ] per Section 44 */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="player-close-btn"
            onClick={onClose}
            className="px-3 py-1.5 bg-[#1F1F24] border border-[#3F3F46] hover:border-[#00A3FF] hover:text-[#00A3FF] text-[#FAF9F6] font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Close player"
          >
            <span>[ X ]</span>
          </button>
        </div>
      </header>

      {/* Main Player Terminal Arena */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-7 pb-16 flex-1 flex flex-col">
        {/* Playback Area (16:9 Black Rectangular Box, Section 21 & 22) */}
        <div className="relative w-full aspect-video bg-black border-2 border-[#1F1F24] shadow-2xl overflow-hidden flex items-center justify-center">
          {/* STATE: INVALID ENTRY ERROR */}
          {playerState === 'error' && (
            <div className="p-8 text-center max-w-md animate-in fade-in">
              <AlertCircle className="w-12 h-12 text-[#EF4444] mx-auto mb-3" />
              <h3 className="font-condensed text-2xl font-bold uppercase tracking-wider text-[#FAF9F6] mb-2">
                PLAYBACK UNAVAILABLE
              </h3>
              <p className="font-serif-editorial text-sm text-[#A8A29E] mb-5">
                Playback is currently unavailable for this title entry.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#1F1F24] border border-[#3F3F46] text-[#FAF9F6] font-condensed uppercase font-bold text-xs tracking-wider hover:bg-[#2B2B30] cursor-pointer"
              >
                RETURN TO CATALOGUE
              </button>
            </div>
          )}

          {/* STATE: USER-FACING CLEAN LOADING (SECTION 3 & 28) */}
          {playerState === 'loading' && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in">
              <RefreshCw className="w-8 h-8 text-[#00A3FF] animate-spin mb-4" />
              <div className="font-condensed text-lg sm:text-xl font-bold uppercase tracking-widest text-[#FAF9F6]">
                Loading...
              </div>
            </div>
          )}

          {/* STATE: READY OR ACTIVE EMBEDDED IFRAME */}
          {playbackUrl && (playerState === 'ready' || playerState === 'loading') && (
            <iframe
              ref={iframeRef}
              id="imdbwatch-player-frame"
              src={playbackUrl}
              title={`${media.title} Playback`}
              className="w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}

          {/* STATE: CLEAN ERROR UI & SOURCE FALLBACK PER SECTION 23, 24, 53 */}
          {playerState === 'source_failed' && (
            <div className="p-8 sm:p-10 text-center max-w-md animate-in fade-in z-20">
              <div className="w-12 h-12 rounded-full bg-[#1F1F24] border border-[#3F3F46] flex items-center justify-center mx-auto mb-4 text-[#A8A29E]">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="font-condensed text-2xl font-bold uppercase tracking-wider text-[#FAF9F6] mb-2">
                PLAYBACK UNAVAILABLE
              </h3>
              <p className="font-serif-editorial text-sm text-[#A8A29E] mb-6 leading-relaxed">
                {availableProviders.length > 1
                  ? 'Playback cannot be embedded for this source.'
                  : 'No playable source is currently available for this title.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {availableProviders.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const other = availableProviders.find(
                        (p) => p.getName() !== selectedProvider?.getName()
                      );
                      if (other) handleSourceChange(other.getName());
                    }}
                    className="px-5 py-2.5 bg-[#00A3FF] text-black font-condensed uppercase font-bold text-xs tracking-widest hover:bg-[#38BDF8] transition-colors cursor-pointer"
                  >
                    [ ← CHOOSE ANOTHER SOURCE ]
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetryPlayback}
                    className="px-4 py-2.5 bg-[#1F1F24] border border-[#3F3F46] text-[#FAF9F6] font-condensed uppercase text-xs tracking-wider hover:border-[#00A3FF] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RETRY PLAYBACK</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#1F1F24] border border-[#3F3F46] text-[#A8A29E] font-condensed uppercase text-xs tracking-wider hover:text-[#FAF9F6] transition-colors cursor-pointer"
                >
                  EXIT PLAYER
                </button>
              </div>
            </div>
          )}
        </div>

        {/* METADATA LINE (SECTION 22): ★ Rating     YEAR     Runtime */}
        <div className="mt-5 pb-4 border-b border-[#2B2B30] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-5 sm:gap-7 font-mono text-sm sm:text-base text-[#FAF9F6]">
            <div className="flex items-center gap-1.5 text-[#EAB308] font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{media.imdbRating}</span>
            </div>
            <div className="text-[#A8A29E] font-medium">{media.releaseYear}</div>
            <div className="text-[#A8A29E]">
              {isTV && currentEpisode ? currentEpisode.duration : media.duration}
            </div>
            <div className="text-xs font-mono uppercase px-2 py-0.5 border border-[#3F3F46] text-[#A8A29E]">
              {media.genres.join(' · ')}
            </div>
          </div>
        </div>

        {/* TV EPISODE CONTROLS (IF TV SHOW) */}
        {isTV && (
          <div className="mt-4 bg-[#141416] border border-[#2B2B30] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A8A29E]">EPISODE:</span>
              <span className="font-condensed text-lg font-bold uppercase text-[#FAF9F6]">
                S{currentSeasonNum.toString().padStart(2, '0')} · E
                {currentEpisode?.episodeNumber.toString().padStart(2, '0')}: {currentEpisode?.title}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => prevEpisode && handleSelectEpisode(prevEpisode, prevEpisode.seasonNumber)}
                disabled={!prevEpisode}
                className={`px-3 py-1.5 text-xs font-condensed uppercase tracking-wider border flex items-center gap-1.5 transition-colors ${
                  prevEpisode
                    ? 'border-[#3F3F46] text-[#FAF9F6] hover:border-[#00A3FF] hover:text-[#00A3FF] cursor-pointer'
                    : 'border-[#27272A] text-[#52525B] cursor-not-allowed'
                }`}
                title="Previous Episode"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>[ ← PREVIOUS ]</span>
              </button>

              <button
                type="button"
                onClick={() => nextEpisode && handleSelectEpisode(nextEpisode, nextEpisode.seasonNumber)}
                disabled={!nextEpisode}
                className={`px-3 py-1.5 text-xs font-condensed uppercase tracking-wider border flex items-center gap-1.5 transition-colors ${
                  nextEpisode
                    ? 'border-[#3F3F46] text-[#FAF9F6] hover:border-[#00A3FF] hover:text-[#00A3FF] cursor-pointer'
                    : 'border-[#27272A] text-[#52525B] cursor-not-allowed'
                }`}
                title="Next Episode"
              >
                <span>[ NEXT EPISODE → ]</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleToggleAutoNext}
                className={`px-3 py-1.5 text-xs font-condensed uppercase tracking-wider border transition-colors cursor-pointer ${
                  autoNext
                    ? 'bg-[#1F1F24] border-[#00A3FF] text-[#00A3FF] font-bold'
                    : 'border-[#3F3F46] text-[#71717A] hover:text-[#FAF9F6]'
                }`}
                title="Auto-advance next episode preference"
              >
                AUTO NEXT: [{autoNext ? 'ON' : 'OFF'}]
              </button>

              <button
                type="button"
                onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
                className="px-3 py-1.5 text-xs font-condensed uppercase tracking-wider border border-[#3F3F46] text-[#FAF9F6] hover:border-[#00A3FF] hover:text-[#00A3FF] transition-colors cursor-pointer"
              >
                {showEpisodeSelector ? 'HIDE EPISODES ▲' : 'SELECT EPISODE ▼'}
              </button>
            </div>
          </div>
        )}

        {/* EPISODE SELECTOR ACCORDION (SECTION 33 & 34) */}
        {isTV && showEpisodeSelector && media.seasons && (
          <div className="mt-3 bg-[#141416] border border-[#2B2B30] p-4 animate-in fade-in">
            {/* Season Selector Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 border-b border-[#27272A]">
              {media.seasons.map((s) => (
                <button
                  key={s.seasonNumber}
                  type="button"
                  onClick={() => setCurrentSeasonNum(s.seasonNumber)}
                  className={`px-3 py-1 text-xs font-condensed uppercase tracking-wider border transition-colors cursor-pointer ${
                    currentSeasonNum === s.seasonNumber
                      ? 'bg-[#00A3FF] text-black border-[#00A3FF] font-bold'
                      : 'border-[#3F3F46] text-[#A8A29E] hover:text-[#FAF9F6]'
                  }`}
                >
                  SEASON {s.seasonNumber.toString().padStart(2, '0')}
                </button>
              ))}
            </div>

            {/* Episode Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentSeason?.episodes.map((ep) => {
                const isSelected = currentEpisode?.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => handleSelectEpisode(ep, currentSeasonNum)}
                    className={`p-3 text-left border transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1F1F24] border-[#00A3FF] text-[#FAF9F6]'
                        : 'bg-[#18181B] border-[#27272A] text-[#A8A29E] hover:border-[#3F3F46] hover:text-[#FAF9F6]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase mb-1">
                        <span className={isSelected ? 'text-[#00A3FF] font-bold' : 'text-[#71717A]'}>
                          EPISODE {ep.episodeNumber.toString().padStart(2, '0')}
                        </span>
                        <span>{ep.duration}</span>
                      </div>
                      <div className="font-condensed text-sm font-bold uppercase line-clamp-1">
                        {ep.title}
                      </div>
                      <p className="font-serif-editorial text-xs line-clamp-2 mt-1 opacity-80">
                        {ep.synopsis}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-[10px] font-mono text-[#00A3FF] uppercase font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>CURRENTLY LOADED</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CONTROLS STACK (SECTION 22): STREAMING SOURCE, VOICE, SUBTITLES */}
        <div className="mt-6 bg-[#141416] border border-[#2B2B30] p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* STREAMING SOURCE (Section 14 & 15: Dynamically populated) */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#71717A] mb-1.5">
                STREAMING SOURCE
              </label>
              <div className="relative">
                <select
                  value={selectedProvider?.getName() || 'IMDbWatch'}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  className="w-full bg-[#1F1F24] border border-[#3F3F46] text-[#FAF9F6] text-xs font-mono uppercase py-2.5 px-3 appearance-none cursor-pointer focus:border-[#00A3FF] focus:outline-none"
                >
                  {availableProviders.map((p) => (
                    <option key={p.getName()} value={p.getName()}>
                      {p.getName()} {failedProviders.includes(p.getName()) ? '(Failed)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[10px] font-mono text-[#71717A] mt-1">
                Active playback integration
              </p>
            </div>

            {/* VOICE LANGUAGE (Section 30: Original Language) */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#71717A] mb-1.5">
                VOICE LANGUAGE
              </label>
              <div className="relative">
                <select
                  value={voiceLanguage}
                  onChange={(e) => setVoiceLanguage(e.target.value)}
                  className="w-full bg-[#1F1F24] border border-[#3F3F46] text-[#FAF9F6] text-xs font-mono uppercase py-2.5 px-3 appearance-none cursor-pointer focus:border-[#00A3FF] focus:outline-none"
                >
                  <option value="Original Language">Original Language</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[10px] font-mono text-[#71717A] mt-1">
                Playback master track
              </p>
            </div>

            {/* ENGLISH SUBTITLES (Section 31: Subtitles controlled by provider) */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#71717A] mb-1.5">
                ENGLISH SUBTITLES
              </label>
              <div className="relative">
                <select
                  value={subtitlesOption}
                  onChange={(e) => setSubtitlesOption(e.target.value)}
                  className="w-full bg-[#1F1F24] border border-[#3F3F46] text-[#FAF9F6] text-xs font-mono uppercase py-2.5 px-3 appearance-none cursor-pointer focus:border-[#00A3FF] focus:outline-none"
                >
                  <option value="Auto-Load English">Auto-Load English</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#71717A] absolute right-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[10px] font-mono text-[#71717A] mt-1">
                Subtitles controlled by playback provider
              </p>
            </div>
          </div>

          {/* PRIMARY ACTION: [ ▶ WATCH NOW ] */}
          <div className="pt-2">
            <button
              id="player-watch-now-action-btn"
              type="button"
              onClick={handleRetryPlayback}
              className="w-full py-4 bg-[#00A3FF] text-black font-condensed uppercase font-bold text-base sm:text-lg tracking-widest hover:bg-[#38BDF8] transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-[#00A3FF]/20"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isTV ? '▶ WATCH EPISODE NOW' : '▶ WATCH MOVIE NOW'}</span>
            </button>
          </div>

          {/* SYNOPSIS SECTION (SECTION 22) */}
          <div className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] mb-2">
              SYNOPSIS
            </div>
            <div className="border-t border-b border-[#27272A] py-3.5">
              <p className="font-serif-editorial text-sm sm:text-base leading-relaxed text-[#E5E5E5]">
                {isTV && currentEpisode ? currentEpisode.synopsis : media.synopsis}
              </p>
            </div>
          </div>
        </div>

        {/* EDITORIAL CREDITS & FUNCTIONAL CAST (SECTION 32) */}
        <div className="mt-6 bg-[#141416] border border-[#2B2B30] p-5 text-xs font-mono">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-[#27272A]">
            <div>
              <span className="text-[#71717A] block text-[10px] uppercase">DIRECTED BY</span>
              <span className="text-[#FAF9F6] font-semibold">{media.director}</span>
            </div>
            <div>
              <span className="text-[#71717A] block text-[10px] uppercase">WRITTEN BY</span>
              <span className="text-[#FAF9F6] font-semibold">{media.writer}</span>
            </div>
            <div>
              <span className="text-[#71717A] block text-[10px] uppercase">DISTRIBUTION</span>
              <span className="text-[#FAF9F6] font-semibold">{media.streamingProvider || 'Archival Print'}</span>
            </div>
          </div>

          {/* Interactive Cast */}
          {media.cast && media.cast.length > 0 && (
            <div className="mt-4 flex items-center flex-wrap gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[#71717A] mr-2">CAST:</span>
              {media.cast.map((actor) => (
                <button
                  key={actor.name}
                  type="button"
                  onClick={() => onSelectActor?.(actor.name)}
                  className="text-xs font-mono uppercase tracking-wide bg-[#1F1F24] border border-[#3F3F46] px-2.5 py-1 text-[#E5E5E5] hover:border-[#00A3FF] hover:text-[#00A3FF] transition-colors cursor-pointer"
                  title={`Inspect ${actor.name} archival filmography`}
                >
                  {actor.name} <span className="opacity-60 text-[10px]">({actor.role})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PLAYBACK DEBUG MODE (SECTION 29) - DEV ONLY */}
        {Boolean((import.meta as any)?.env?.DEV ?? false) && (
          <div className="mt-6 bg-[#000000] border border-[#00A3FF]/40 p-4 font-mono text-xs text-[#00A3FF]">
            <div className="flex items-center justify-between border-b border-[#00A3FF]/20 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="font-bold tracking-wider">DEVELOPER PLAYBACK DEBUG</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                className="text-[10px] border border-[#00A3FF]/40 px-2 py-0.5 hover:bg-[#00A3FF]/20 cursor-pointer"
              >
                {showDebug ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {showDebug && (
              <div className="space-y-1.5 text-[11px] text-[#A8A29E]">
                <div>
                  <strong className="text-[#FAF9F6]">Active Provider:</strong>{' '}
                  {selectedProvider?.getName() || 'None'}
                </div>
                <div>
                  <strong className="text-[#FAF9F6]">State:</strong>{' '}
                  <span className="uppercase font-bold text-[#00A3FF]">{playerState}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AD SANDBOX (SECTION 43) */}
        <div className="mt-8">
          <AdSandbox />
        </div>
      </main>
    </div>
  );
};
