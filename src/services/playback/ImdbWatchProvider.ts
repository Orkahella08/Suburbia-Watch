import { PlaybackProvider } from './PlaybackProvider';
import { MediaItem, Episode } from '../../types';
import { extractImdbId, validateImdbId } from '../../utils/imdb';
import { buildStreamImdbEmbedUrl } from '../imdbWatchService';

export { extractImdbId, validateImdbId };

/**
 * Checks if a title or string contains a valid IMDb ID.
 */
export function hasValidImdbId(title?: MediaItem | string | null): boolean {
  if (!title) return false;

  if (typeof title === 'string') {
    const extracted = extractImdbId(title) || (validateImdbId(title) ? title : null);
    return Boolean(extracted && validateImdbId(extracted));
  }

  const candidate =
    title.imdbId ||
    (validateImdbId(title.id) ? title.id : null) ||
    (title.videoUrl && extractImdbId(title.videoUrl));

  if (!candidate) return false;
  const extracted = extractImdbId(candidate) || (validateImdbId(candidate) ? candidate : null);
  return Boolean(extracted && validateImdbId(extracted));
}

/**
 * Builds the IMDbWatch streaming playback URL for an IMDb ID.
 * Returns 'https://streamimdb.ru/embed/movie/${imdbId}' or '/tv/${imdbId}/${season}/${episode}'
 */
export function buildImdbWatchUrl(
  imdbId?: string | null,
  type: 'movie' | 'tv' = 'movie',
  seasonNumber: number = 1,
  episodeNumber: number = 1
): string {
  if (!imdbId) return '';
  const cleanId = extractImdbId(imdbId) || (validateImdbId(imdbId) ? imdbId : null) || imdbId.trim().toLowerCase();
  return buildStreamImdbEmbedUrl(cleanId, type, seasonNumber, episodeNumber);
}

export class ImdbWatchProvider implements PlaybackProvider {
  getName(): string {
    return 'IMDbWatch';
  }

  hasValidImdbId(title?: MediaItem | string | null): boolean {
    return hasValidImdbId(title);
  }

  buildImdbWatchUrl(
    imdbId?: string | null,
    type: 'movie' | 'tv' = 'movie',
    seasonNumber: number = 1,
    episodeNumber: number = 1
  ): string {
    return buildImdbWatchUrl(imdbId, type, seasonNumber, episodeNumber);
  }

  canPlay(title?: MediaItem | null, episode?: Episode | null): boolean {
    if (!title) return false;

    // For TV episodes, check episode IMDb ID or fallback to show IMDb ID
    if (episode && episode.imdbId) {
      if (hasValidImdbId(episode.imdbId)) {
        return true;
      }
    }

    return hasValidImdbId(title) || Boolean(title.id);
  }

  getPlaybackUrl(title?: MediaItem | null, episode?: Episode | null): string | null {
    if (!title) return null;

    const rawId = title.imdbId || (validateImdbId(title.id) ? title.id : null) || title.id;
    const cleanId = extractImdbId(rawId) || rawId || 'tt26443597';

    if (title.type === 'tv') {
      const epNum = episode?.episodeNumber || 1;
      return buildStreamImdbEmbedUrl(cleanId, 'tv', 1, epNum);
    }

    return buildStreamImdbEmbedUrl(cleanId, 'movie');
  }
}

export default ImdbWatchProvider;

