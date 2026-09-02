import { WatchProgress } from '../types';

const WATCHLIST_KEY = 'suburbia_watch_watchlist_v2';
const PROGRESS_KEY = 'suburbia_watch_progress_v2';
const AUTO_NEXT_KEY = 'suburbia_watch_auto_next_v2';

export function getStoredWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load watchlist from localStorage', e);
  }
  // Default seeded curated watchlist
  return ['the-batman', 'stranger-things', 'the-last-of-us', 'parasite'];
}

export function saveStoredWatchlist(ids: string[]): void {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save watchlist to localStorage', e);
  }
}

export function getStoredProgress(): Record<string, WatchProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
  }
  // Default continue watching entries demonstrating localStorage capability
  return {
    'the-last-of-us': {
      mediaId: 'the-last-of-us',
      imdbId: 'tt3581920',
      title: 'The Last of Us',
      type: 'tv',
      episodeId: 'tlou-s1e4',
      episodeTitle: 'Please Hold to My Hand',
      seasonNumber: 1,
      episodeNumber: 4,
      progressSeconds: 1934,
      totalSeconds: 3000,
      formattedTime: '32:14',
      updatedAt: Date.now() - 3600000 * 2,
    },
    'stranger-things': {
      mediaId: 'stranger-things',
      imdbId: 'tt4574334',
      title: 'Stranger Things',
      type: 'tv',
      episodeId: 'st-s2e3',
      episodeTitle: 'The Pollywog',
      seasonNumber: 2,
      episodeNumber: 3,
      progressSeconds: 1122,
      totalSeconds: 3060,
      formattedTime: '18:42',
      updatedAt: Date.now() - 3600000 * 14,
    },
    'the-batman': {
      mediaId: 'the-batman',
      imdbId: 'tt1877830',
      title: 'The Batman',
      type: 'movie',
      progressSeconds: 5240,
      totalSeconds: 10560,
      formattedTime: '1H 27M',
      updatedAt: Date.now() - 3600000 * 36,
    },
  };
}

export function saveStoredProgress(progressMap: Record<string, WatchProgress>): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function getAutoNextPreference(): boolean {
  try {
    const raw = localStorage.getItem(AUTO_NEXT_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load auto-next preference', e);
  }
  return true;
}

export function saveAutoNextPreference(enabled: boolean): void {
  try {
    localStorage.setItem(AUTO_NEXT_KEY, JSON.stringify(enabled));
  } catch (e) {
    console.error('Failed to save auto-next preference', e);
  }
}
