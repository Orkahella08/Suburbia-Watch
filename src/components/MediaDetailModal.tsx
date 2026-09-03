import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem, Episode, Season } from '../types';
import { defaultPlaybackManager } from '../services/playback/PlaybackManager';
import { X, Play, Bookmark, BookmarkCheck, Share2, Check, Star, ExternalLink } from 'lucide-react';
import { PosterImage } from './PosterImage';
import { WhereToWatch } from './WhereToWatch';
import { fetchTvSeasonsAndEpisodes } from '../services/imdbService';
import { extractImdbId } from '../utils/imdb';
import { DEFAULT_COUNTRY_CODE } from '../services/streamingAvailabilityService';

interface MediaDetailModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onPlay: (item: MediaItem, seasonNumber?: number, episodeId?: string) => void;
  watchlist: string[];
  onToggleWatchlist: (item: MediaItem) => void;
  onSelectActor?: (actorName: string) => void;
  countryCode?: string;
  onSelectCountry?: (countryCode: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  onPlay,
  watchlist,
  onToggleWatchlist,
  onSelectActor,
  countryCode = DEFAULT_COUNTRY_CODE,
  onSelectCountry,
}) => {
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tvSeasons, setTvSeasons] = useState<Season[]>(item?.seasons || []);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    if (!item || item.type !== 'tv') {
      setTvSeasons([]);
      return;
    }

    if (item.seasons && item.seasons.length > 0 && item.seasons[0].episodes.length > 0) {
      setTvSeasons(item.seasons);
      return;
    }

    const cleanId = extractImdbId(item.imdbId) || item.id;
    setLoadingEpisodes(true);
    fetchTvSeasonsAndEpisodes(cleanId)
      .then((seasons) => {
        if (seasons && seasons.length > 0) {
          setTvSeasons(seasons);
        }
      })
      .finally(() => {
        setLoadingEpisodes(false);
      });
  }, [item]);

  if (!item) return null;

  const isSaved = watchlist.includes(item.id);
  const isTV = item.type === 'tv';
  const cleanImdb = extractImdbId(item.imdbId) || item.id;
  const currentSeason = isTV
    ? tvSeasons.find((s) => s.seasonNumber === selectedSeasonNumber) || tvSeasons[0]
    : null;

  const availableProviders = defaultPlaybackManager.getAvailableProviders(item);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      id="film-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#141414]/85 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#E8E5DC] text-[#141414] border-2 border-[#141414] max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-8 md:p-10 shadow-2xl relative my-auto font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Archival Catalog Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#141414] pb-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
              SUBURBIA ARCHIVE · {item.type === 'tv' ? 'SERIAL EDITION' : '35MM FEATURE PRINT'}
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 bg-[#141414]" />
            <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-[#141414] font-bold">
              RELEASE: {item.releaseYear}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[#141414] hover:bg-[#141414] hover:text-[#FAF9F6] transition-colors cursor-pointer"
            aria-label="Close archive entry"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Editorial Film Page Layout (Section 17) */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-6 sm:gap-8 items-start mb-8">
          {/* LARGE MOVIE POSTER (2:3 PORTRAIT RATIO) */}
          <div className="flex flex-col group">
            <div className="ink-bleed-container w-full aspect-[2/3] bg-[#141414] border-2 border-[#141414] overflow-hidden shadow-lg relative">
              <PosterImage
                src={item.posterUrl}
                alt={item.title}
                imdbId={item.imdbId}
                title={item.title}
                year={item.releaseYear}
                aspectRatio="2/3"
                loading="eager"
                imgClassName="ink-bleed-image film-photo-treatment"
              />
              <div className="ink-bleed-fringe" aria-hidden="true" />
              {item.neighborhoodBadge && (
                <div className="absolute top-2 left-2 bg-[#141414] text-[#FAF9F6] text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 border border-white/20 z-10">
                  {item.neighborhoodBadge}
                </div>
              )}
            </div>

            {/* Provider Availability Callout */}
            <div className="mt-3 bg-[#F4F1EA] border border-[#141414]/30 p-3 text-center">
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#78716C]">
                STREAMING REPERTORY
              </div>
              <div className="font-condensed text-xs uppercase tracking-wider text-[#57534E] mt-0.5">
                AVAILABLE ON
              </div>
              <div className="font-condensed text-lg font-bold uppercase tracking-wider text-[#141414]">
                {item.streamingProvider}
              </div>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Synopsis, Primary Action */}
          <div className="flex flex-col">
            {/* Title & Year */}
            <div className="border-b border-[#141414]/30 pb-3 mb-4">
              <div className="flex items-baseline justify-between gap-3">
                <h1 className="font-condensed text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#141414] leading-none">
                  {item.title}
                </h1>
                <span className="font-mono text-2xl font-bold text-[#141414] shrink-0">
                  {item.releaseYear}
                </span>
              </div>
              {item.tagline && (
                <p className="font-serif-editorial italic text-sm text-[#57534E] mt-1.5">
                  &ldquo;{item.tagline}&rdquo;
                </p>
              )}
            </div>

            {/* GENRE */}
            <div className="mb-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
                GENRE
              </div>
              <div className="font-condensed text-lg uppercase tracking-wider text-[#141414] font-semibold mt-0.5">
                {item.genres.join(' · ')}
              </div>
            </div>

            {/* Strict Two-Column Metadata Block (IMDb Rating, Runtime, Director, Writer) */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#141414]/20 mb-5 text-xs font-mono">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#78716C]">
                  IMDb RATING
                </div>
                <div className="text-base font-bold text-[#141414] flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-current text-[#141414]" />
                  <span>{item.imdbRating} / 10</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#78716C]">
                  RUNTIME
                </div>
                <div className="text-base font-bold text-[#141414] mt-0.5">
                  {item.duration || `${item.seasonsCount} SEASONS`}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#78716C]">
                  DIRECTED BY
                </div>
                <div className="text-sm font-semibold text-[#141414] uppercase mt-0.5">
                  {item.director}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#78716C]">
                  WRITTEN BY
                </div>
                <div className="text-sm font-semibold text-[#141414] uppercase mt-0.5">
                  {item.writer}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#78716C]">
                  COUNTRY
                </div>
                <div className="text-sm text-[#141414] uppercase mt-0.5">
                  {item.country}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#78716C]">
                  ARCHIVAL REF
                </div>
                <div className="text-sm font-bold text-[#141414] uppercase mt-0.5 font-mono">
                  #{item.id.toUpperCase().slice(0, 10)}
                </div>
              </div>
            </div>

            {/* STARRING (Clickable interactive cast members per Section 19) */}
            <div className="mb-5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1.5">
                STARRING
              </div>
              <div className="flex flex-wrap gap-2">
                {item.cast.map((actor) => (
                  <button
                    key={actor.name}
                    type="button"
                    onClick={() => onSelectActor?.(actor.name)}
                    className="flex items-center gap-2 bg-[#F4F1EA] border border-[#141414]/30 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wide hover:border-[#141414] hover:bg-[#141414] hover:text-[#FAF9F6] transition-colors cursor-pointer text-left"
                    title={`View ${actor.name}'s bio and filmography`}
                  >
                    <img
                      src={actor.avatar}
                      alt={actor.name}
                      className="w-5 h-5 rounded-full object-cover border border-[#141414]/40"
                    />
                    <span>
                      <strong className="font-bold">{actor.name}</strong>{' '}
                      <span className="opacity-60 text-[10px]">as {actor.role}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* SYNOPSIS */}
            <div className="mb-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C] mb-1">
                SYNOPSIS
              </div>
              <p className="font-serif-editorial text-sm sm:text-base text-[#141414] leading-relaxed text-justify">
                {item.synopsis}
              </p>
            </div>

            {/* WHERE TO WATCH / LEGITIMATE STREAMING AVAILABILITY (SECTIONS 2 & 4) */}
            <div className="mb-6 bg-[#F4F1EA] border-2 border-[#141414] p-4 sm:p-5 shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
              <WhereToWatch
                media={item}
                countryCode={countryCode}
                onSelectCountry={onSelectCountry}
                showCountrySelector={true}
                onPlayInApp={() => onPlay(item)}
              />
            </div>

            {/* PRIMARY ACTION: WATCH NOW BUTTON */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="modal-watch-now-btn"
                type="button"
                onClick={() => {
                  onPlay(item);
                }}
                className="bg-[#141414] text-[#FAF9F6] px-8 py-3.5 text-sm font-condensed uppercase tracking-widest font-bold hover:bg-[#00A3FF] hover:text-black transition-colors flex items-center gap-2.5 cursor-pointer border border-[#141414] shadow-[3px_3px_0px_0px_rgba(20,20,20,0.3)]"
                title="Launch video player"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>WATCH NOW</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWatchlist(item)}
                className="bg-transparent text-[#141414] px-5 py-3.5 text-sm font-condensed uppercase tracking-widest hover:bg-[#141414]/10 transition-colors border border-[#141414] flex items-center gap-2 cursor-pointer"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-[#141414]" />
                    <span>IN ARCHIVE INDEX</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>+ ADD TO ARCHIVE</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="bg-transparent text-[#57534E] hover:text-[#141414] px-4 py-3.5 text-sm font-condensed uppercase tracking-widest hover:bg-[#141414]/5 transition-colors border border-[#141414]/30 flex items-center gap-1.5 cursor-pointer ml-auto"
                title="Share archival film entry"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-700" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'COPIED' : 'SHARE'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* TV SHOW SEASONS & EPISODES BREAKDOWN (SECTIONS 8 & 20) */}
        {isTV && (
          <div className="border-t-2 border-[#141414] pt-6 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-condensed text-2xl font-bold uppercase tracking-tight text-[#141414]">
                  EPISODIC ARCHIVE
                </h3>
                <p className="font-serif-editorial text-xs text-[#57534E]">
                  Verified seasons and broadcast chapters.
                </p>
              </div>

              {/* Season Selector */}
              {tvSeasons.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {tvSeasons.map((s) => (
                    <button
                      key={s.seasonNumber}
                      type="button"
                      id={`modal-season-tab-${s.seasonNumber}`}
                      onClick={() => setSelectedSeasonNumber(s.seasonNumber)}
                      className={`px-3 py-1.5 text-xs font-condensed uppercase tracking-wider transition-colors cursor-pointer border ${
                        selectedSeasonNumber === s.seasonNumber
                          ? 'bg-[#141414] text-[#FAF9F6] border-[#141414] font-bold'
                          : 'bg-[#F4F1EA] text-[#141414] border-[#141414]/30 hover:border-[#141414]'
                      }`}
                    >
                      SEASON {s.seasonNumber.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loadingEpisodes ? (
              <div className="py-8 text-center text-[#78716C] font-mono text-xs">
                Retrieving verified episode listings from IMDb...
              </div>
            ) : currentSeason && currentSeason.episodes.length > 0 ? (
              <div className="space-y-3">
                {currentSeason.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="bg-[#F4F1EA] border border-[#141414]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#141414] transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-xl font-bold text-[#141414] w-8 shrink-0">
                        {ep.episodeNumber.toString().padStart(2, '0')}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#78716C] uppercase">
                          <span>{ep.duration}</span>
                          {ep.releaseDate && (
                            <>
                              <span>•</span>
                              <span>{ep.releaseDate}</span>
                            </>
                          )}
                        </div>
                        <h4 className="font-condensed text-lg font-bold uppercase tracking-tight text-[#141414]">
                          {ep.title}
                        </h4>
                        <p className="font-serif-editorial text-xs text-[#57534E] mt-1 max-w-2xl leading-relaxed">
                          {ep.synopsis}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPlay(item, selectedSeasonNumber, ep.id)}
                      className="bg-[#141414] text-[#FAF9F6] px-4 py-2 text-xs font-condensed uppercase tracking-widest font-bold hover:bg-[#2B2A27] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-center border border-[#141414]"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>WATCH</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[#78716C] font-mono text-xs bg-[#F4F1EA] border border-[#141414]/20">
                Single season / serial edition available for instant projection.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
