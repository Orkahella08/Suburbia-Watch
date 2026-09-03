/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MediaItem, WatchProgress, NavTab } from './types';
import { MEDIA_ITEMS } from './data/mockData';
import {
  getStoredWatchlist,
  saveStoredWatchlist,
  getStoredProgress,
  saveStoredProgress,
} from './utils/storage';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ContinueWatchingShelf } from './components/ContinueWatchingShelf';
import { EditorialMovieCard } from './components/EditorialMovieCard';
import { MediaDetailModal } from './components/MediaDetailModal';
import { WatchPlayer } from './components/WatchPlayer';
import { ActorBioModal } from './components/ActorBioModal';
import { MoviesView } from './components/MoviesView';
import { TVShowsView } from './components/TVShowsView';
import { GenresView } from './components/GenresView';
import { SearchView } from './components/SearchView';
import { WatchlistView } from './components/WatchlistView';
import { StreamingPlatformExplorer } from './components/StreamingPlatformExplorer';
import { fetchCuratedImdbCatalogue } from './services/imdbService';
import { Footer } from './components/Footer';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, WatchProgress>>({});

  // Active Player State
  const [playingMedia, setPlayingMedia] = useState<{
    media: MediaItem;
    seasonNumber?: number;
    episodeId?: string;
  } | null>(null);

  // Active Detail Modal State
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);

  // Active Actor Bio State
  const [selectedActor, setSelectedActor] = useState<string | null>(null);

  // Real detected IMDb catalogue
  const [catalogMedia, setCatalogMedia] = useState<MediaItem[]>(MEDIA_ITEMS);

  // Load persistence and real detected IMDb titles
  useEffect(() => {
    setWatchlist(getStoredWatchlist());
    setProgressMap(getStoredProgress());

    fetchCuratedImdbCatalogue().then((items) => {
      if (items && items.length > 0) {
        setCatalogMedia((prev) => {
          const map = new Map<string, MediaItem>();
          for (const it of items) map.set(it.id, it);
          for (const it of prev) {
            if (!map.has(it.id)) map.set(it.id, it);
          }
          return Array.from(map.values());
        });
      }
    });
  }, []);

  // Watchlist handlers
  const handleToggleWatchlist = (item: MediaItem) => {
    setWatchlist((prev) => {
      const next = prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id];
      saveStoredWatchlist(next);
      return next;
    });
  };

  const handleClearWatchlist = () => {
    setWatchlist([]);
    saveStoredWatchlist([]);
  };

  // Progress handlers
  const handleUpdateProgress = (progress: WatchProgress) => {
    setProgressMap((prev) => {
      const next = { ...prev, [progress.mediaId]: progress };
      saveStoredProgress(next);
      return next;
    });
  };

  const handleClearProgress = (mediaId?: string) => {
    setProgressMap((prev) => {
      if (mediaId) {
        const next = { ...prev };
        delete next[mediaId];
        saveStoredProgress(next);
        return next;
      } else {
        saveStoredProgress({});
        return {};
      }
    });
  };

  // Play item handler
  const handlePlay = (item: MediaItem, seasonNumber?: number, episodeId?: string) => {
    setDetailItem(null);
    setSelectedActor(null);
    setPlayingMedia({
      media: item,
      seasonNumber,
      episodeId,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Resume handler from Continue Watching
  const handleResumeProgress = (prog: WatchProgress) => {
    const item = catalogMedia.find((m) => m.id === prog.mediaId);
    if (item) {
      handlePlay(item, prog.seasonNumber, prog.episodeId);
    }
  };

  // Progress list sorted by most recently updated
  const progressList = useMemo(() => {
    const list = Object.values(progressMap) as WatchProgress[];
    return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [progressMap]);

  // Curated Homepage Media Segments from real detected catalogue
  const featuredItems = useMemo(
    () => catalogMedia.filter((i) => i.featured || i.communityRating >= 90),
    [catalogMedia]
  );
  const popularMovies = useMemo(
    () => catalogMedia.filter((i) => i.type === 'movie' && (i.popular || i.imdbRating >= 7.5)),
    [catalogMedia]
  );
  const tvSeries = useMemo(
    () => catalogMedia.filter((i) => i.type === 'tv'),
    [catalogMedia]
  );
  const newReleases = useMemo(
    () => catalogMedia.filter((i) => i.newRelease || i.releaseYear >= 2023),
    [catalogMedia]
  );
  const criticallyAcclaimed = useMemo(
    () => catalogMedia.filter((i) => i.criticallyAcclaimed || i.imdbRating >= 8.2),
    [catalogMedia]
  );

  // If Player view is active
  if (playingMedia) {
    return (
      <div className="min-h-screen bg-[#E8E5DC] text-[#141414]">
        <WatchPlayer
          media={playingMedia.media}
          initialSeasonNumber={playingMedia.seasonNumber}
          initialEpisodeId={playingMedia.episodeId}
          onClose={() => setPlayingMedia(null)}
          onUpdateProgress={handleUpdateProgress}
          savedProgress={progressMap[playingMedia.media.id]}
          onSelectActor={(actorName) => setSelectedActor(actorName)}
          onPlayMedia={(item, seasonNum, epId) => handlePlay(item, seasonNum, epId)}
          onPlayNextMedia={(nextMedia) => handlePlay(nextMedia)}
          allMedia={catalogMedia}
        />

        {/* Actor bio if opened from player */}
        {selectedActor && (
          <ActorBioModal
            actorName={selectedActor}
            onClose={() => setSelectedActor(null)}
            allMedia={MEDIA_ITEMS}
            onOpenDetails={(item) => {
              setSelectedActor(null);
              setDetailItem(item);
            }}
            onPlay={(item) => {
              setSelectedActor(null);
              handlePlay(item);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E5DC] dark:bg-[#0F0F10] text-[#141414] dark:text-[#F4F4F5] flex flex-col font-sans selection:bg-[#141414] selection:text-[#FAF9F6] dark:selection:bg-[#F4F4F5] dark:selection:text-[#141414] transition-colors duration-200">
      {/* Universal Minimalist Editorial Header (Section 15: No login/accounts) */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        watchlistCount={watchlist.length}
      />

      {/* Main Catalog Body */}
      <main className="flex-1">
        {/* HOMEPAGE VIEW (Section 15) */}
        {currentTab === 'home' && (
          <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-10">
              {/* 1. CONTINUE WATCHING (ACTIVE PROJECTIONS · LOCAL PROGRESS) */}
              <ContinueWatchingShelf
                progressList={progressList}
                allMedia={catalogMedia}
                onResume={handleResumeProgress}
                onClearProgress={handleClearProgress}
              />
            </div>

            {/* 2. HERO CAROUSEL: Large 16:9 cinematic landscape artwork (Section 15 & 16) */}
            <HeroBanner
              featuredItems={featuredItems}
              onPlay={handlePlay}
              onOpenDetails={(film) => setDetailItem(film)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
              {/* STREAMING PLATFORMS & POPULAR / IN-DEMAND EXPLORER */}
              <StreamingPlatformExplorer
                items={catalogMedia}
                onPlay={handlePlay}
                onOpenDetails={(film) => setDetailItem(film)}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onSelectActor={(actorName) => setSelectedActor(actorName)}
              />

              {/* 1. FEATURED FILMS (Section 15) */}
              <section id="section-featured-films" className="mb-14">
                <div className="flex items-baseline justify-between border-b-2 border-[#141414] pb-3 mb-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
                      CURATOR’S SELECTION · 35MM EDITIONS
                    </div>
                    <h2 className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414]">
                      FEATURED FILMS
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab('movies');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="font-condensed text-xs uppercase tracking-wider font-bold text-[#141414] hover:text-[#57534E] flex items-center gap-1 cursor-pointer py-1"
                  >
                    <span>VIEW ALL FILMS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Responsive 5-6 poster grid (Section 11) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {featuredItems.slice(0, 6).map((item) => (
                    <EditorialMovieCard
                      key={item.id}
                      item={item}
                      onPlay={handlePlay}
                      onOpenDetails={(film) => setDetailItem(film)}
                      watchlist={watchlist}
                      onToggleWatchlist={handleToggleWatchlist}
                      onSelectActor={(actorName) => setSelectedActor(actorName)}
                    />
                  ))}
                </div>
              </section>

              {/* 2. POPULAR MOVIES (Section 15) */}
              <section id="section-popular-movies" className="mb-14">
                <div className="flex items-baseline justify-between border-b-2 border-[#141414] pb-3 mb-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
                      GLOBAL AUDIENCE FAVORITES · CONTEMPORARY MASTERPIECES
                    </div>
                    <h2 className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414]">
                      POPULAR MOVIES
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab('movies');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="font-condensed text-xs uppercase tracking-wider font-bold text-[#141414] hover:text-[#57534E] flex items-center gap-1 cursor-pointer py-1"
                  >
                    <span>EXPLORE ALL</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {popularMovies.slice(0, 6).map((item) => (
                    <EditorialMovieCard
                      key={item.id}
                      item={item}
                      onPlay={handlePlay}
                      onOpenDetails={(film) => setDetailItem(film)}
                      watchlist={watchlist}
                      onToggleWatchlist={handleToggleWatchlist}
                      onSelectActor={(actorName) => setSelectedActor(actorName)}
                    />
                  ))}
                </div>
              </section>

              {/* 3. TV SERIES (Section 15) */}
              <section id="section-tv-series" className="mb-14">
                <div className="flex items-baseline justify-between border-b-2 border-[#141414] pb-3 mb-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
                      SERIAL EDITIONS · EPISODIC REPERTORY
                    </div>
                    <h2 className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414]">
                      TV SERIES
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab('tv');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="font-condensed text-xs uppercase tracking-wider font-bold text-[#141414] hover:text-[#57534E] flex items-center gap-1 cursor-pointer py-1"
                  >
                    <span>VIEW ALL SERIES</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {tvSeries.slice(0, 6).map((item) => (
                    <EditorialMovieCard
                      key={item.id}
                      item={item}
                      onPlay={handlePlay}
                      onOpenDetails={(film) => setDetailItem(film)}
                      watchlist={watchlist}
                      onToggleWatchlist={handleToggleWatchlist}
                      onSelectActor={(actorName) => setSelectedActor(actorName)}
                    />
                  ))}
                </div>
              </section>

              {/* 4. NEW RELEASES (Section 15) */}
              <section id="section-new-releases" className="mb-14">
                <div className="flex items-baseline justify-between border-b-2 border-[#141414] pb-3 mb-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
                      RECENT PREMIÈRES · 2023–2024 PRINTS
                    </div>
                    <h2 className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414]">
                      NEW RELEASES
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#57534E] uppercase">
                    FRESH ADDITIONS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {newReleases.slice(0, 6).map((item) => (
                    <EditorialMovieCard
                      key={item.id}
                      item={item}
                      onPlay={handlePlay}
                      onOpenDetails={(film) => setDetailItem(film)}
                      watchlist={watchlist}
                      onToggleWatchlist={handleToggleWatchlist}
                      onSelectActor={(actorName) => setSelectedActor(actorName)}
                    />
                  ))}
                </div>
              </section>

              {/* 5. CRITICALLY ACCLAIMED (Section 15) */}
              <section id="section-critically-acclaimed" className="mb-14">
                <div className="flex items-baseline justify-between border-b-2 border-[#141414] pb-3 mb-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
                      CANNES & ACADEMY HONOREES · IMDb 8.5+
                    </div>
                    <h2 className="font-condensed text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#141414]">
                      CRITICALLY ACCLAIMED
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#57534E] uppercase">
                    AWARDS & JURY CITATIONS
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {criticallyAcclaimed.slice(0, 6).map((item) => (
                    <EditorialMovieCard
                      key={item.id}
                      item={item}
                      onPlay={handlePlay}
                      onOpenDetails={(film) => setDetailItem(film)}
                      watchlist={watchlist}
                      onToggleWatchlist={handleToggleWatchlist}
                      onSelectActor={(actorName) => setSelectedActor(actorName)}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* FEATURE FILMS TAB VIEW (Section 28) */}
        {currentTab === 'movies' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <MoviesView
              movies={catalogMedia}
              onPlay={handlePlay}
              onOpenDetails={(item) => setDetailItem(item)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectActor={(actorName) => setSelectedActor(actorName)}
            />
          </div>
        )}

        {/* TV SHOWS TAB VIEW (Section 29) */}
        {currentTab === 'tv' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <TVShowsView
              items={catalogMedia}
              onPlay={handlePlay}
              onOpenDetails={(item) => setDetailItem(item)}
              onSelectActor={(actorName) => setSelectedActor(actorName)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {/* GENRES TAB VIEW (Section 30) */}
        {currentTab === 'genres' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <GenresView
              items={catalogMedia}
              onPlay={handlePlay}
              onOpenDetails={(item) => setDetailItem(item)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectActor={(actorName) => setSelectedActor(actorName)}
            />
          </div>
        )}

        {/* SEARCH TAB VIEW (Section 32) */}
        {currentTab === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <SearchView
              items={catalogMedia}
              onPlay={handlePlay}
              onOpenDetails={(item) => setDetailItem(item)}
              onSelectActor={(actorName) => setSelectedActor(actorName)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          </div>
        )}

        {/* WATCHLIST / LOCAL ARCHIVE INDEX TAB VIEW (Section 33) */}
        {currentTab === 'watchlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <WatchlistView
              watchlistIds={watchlist}
              allItems={catalogMedia}
              onPlay={handlePlay}
              onOpenDetails={(item) => setDetailItem(item)}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectActor={(actorName) => setSelectedActor(actorName)}
              onExplore={() => setCurrentTab('home')}
              onClearAll={handleClearWatchlist}
            />
          </div>
        )}
      </main>

      {/* Editorial Colophon Footer */}
      <Footer onSelectTab={(tab) => setCurrentTab(tab)} />

      {/* Dedicated Cinematic Film Details Modal (Section 17 & 18) */}
      {detailItem && (
        <MediaDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onPlay={handlePlay}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onSelectActor={(actorName) => {
            setDetailItem(null);
            setSelectedActor(actorName);
          }}
        />
      )}

      {/* Actor Biographical Dossier Modal (Section 19) */}
      {selectedActor && (
        <ActorBioModal
          actorName={selectedActor}
          onClose={() => setSelectedActor(null)}
          allMedia={catalogMedia}
          onOpenDetails={(item) => setDetailItem(item)}
          onPlay={(item) => handlePlay(item)}
        />
      )}
    </div>
  );
}
