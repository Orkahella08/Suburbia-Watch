import { extractImdbId, validateImdbId } from '../utils/imdb';
import { MediaItem, Episode } from '../types';

export interface ImdbWatchTranslationResult {
  ok: boolean;
  imdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  embedUrl: string;
  imdbWatchUrl: string;
  provider: string;
  providerDomain: string;
}

/**
 * Generates the in-app streaming player URL which routes through our local
 * /api/stream/embed bridge or directly to streamimdb.ru.
 */
export function buildInAppStreamUrl(
  imdbId?: string | null,
  type: 'movie' | 'tv' = 'movie',
  seasonNumber: number = 1,
  episodeNumber: number = 1
): string {
  return buildStreamImdbEmbedUrl(imdbId, type, seasonNumber, episodeNumber);
}

/**
 * Directly formats the streamimdb.ru embed URL for a movie or TV episode.
 * Example movie: https://streamimdb.ru/embed/movie/tt26443597
 * Example TV:    https://streamimdb.ru/embed/tv/tt6226232
 */
export function buildStreamImdbEmbedUrl(
  imdbId?: string | null,
  type: 'movie' | 'tv' = 'movie',
  seasonNumber: number = 1,
  episodeNumber: number = 1
): string {
  if (!imdbId) return '';
  const cleanId = extractImdbId(imdbId) || (validateImdbId(imdbId) ? imdbId : null) || imdbId.trim().toLowerCase();
  
  if (type === 'tv') {
    if (seasonNumber > 1 || episodeNumber > 1) {
      return `https://streamimdb.ru/embed/tv/${cleanId}/${seasonNumber}/${episodeNumber}`;
    }
    return `https://streamimdb.ru/embed/tv/${cleanId}`;
  }
  return `https://streamimdb.ru/embed/movie/${cleanId}`;
}

/**
 * Asynchronously translates an IMDb title/ID using the /api/imdbwatch API endpoint
 * with immediate fallback to synchronous URL calculation.
 */
export async function translateImdbToStream(params: {
  id?: string | null;
  imdbId?: string | null;
  title?: string;
  type?: 'movie' | 'tv';
  season?: number;
  episode?: number;
}): Promise<ImdbWatchTranslationResult> {
  const rawId = params.id || params.imdbId || '';
  const cleanId = extractImdbId(rawId) || (rawId && validateImdbId(rawId) ? rawId : null) || 'tt6226232';
  const type = params.type || 'movie';
  const season = params.season || 1;
  const episode = params.episode || 1;

  // Immediate synchronous fallback template
  const fallbackEmbedUrl = buildStreamImdbEmbedUrl(cleanId, type, season, episode);
  const fallbackResult: ImdbWatchTranslationResult = {
    ok: true,
    imdbId: cleanId,
    type,
    season: type === 'tv' ? season : undefined,
    episode: type === 'tv' ? episode : undefined,
    embedUrl: fallbackEmbedUrl,
    imdbWatchUrl: fallbackEmbedUrl,
    provider: 'streamimdb.ru',
    providerDomain: 'streamimdb.ru',
  };

  try {
    const query = new URLSearchParams();
    query.set('id', cleanId);
    query.set('type', type);
    if (type === 'tv') {
      query.set('season', season.toString());
      query.set('episode', episode.toString());
    }
    if (params.title) {
      query.set('title', params.title);
    }

    const response = await fetch(`/api/imdbwatch/translate?${query.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.embedUrl) {
        return data as ImdbWatchTranslationResult;
      }
    }
  } catch (err) {
    console.warn('IMDb translation API call fallback to client resolver', err);
  }

  return fallbackResult;
}

/**
 * Resolves the active player embed URL for a given MediaItem and optional TV episode.
 */
export function getImdbWatchPlayerUrl(
  media: MediaItem,
  seasonNumber: number = 1,
  episode?: Episode | null
): string {
  const cleanId = extractImdbId(media.imdbId) || (validateImdbId(media.id) ? media.id : null) || 'tt26443597';
  const isTv = media.type === 'tv';

  if (isTv) {
    const epNum = episode?.episodeNumber || 1;
    return buildStreamImdbEmbedUrl(cleanId, 'tv', seasonNumber, epNum);
  }

  return buildStreamImdbEmbedUrl(cleanId, 'movie');
}
