import { PlaybackProvider } from './PlaybackProvider';
import { MediaItem, Episode } from '../../types';
import { extractImdbId, validateImdbId, buildImdbWatchUrl as utilBuildImdbWatchUrl } from '../../utils/imdb';

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
 * Builds the IMDbWatch playback URL for an IMDb ID.
 * Returns 'https://www.imdbwatch.com/title/${imdbId}/'
 */
export function buildImdbWatchUrl(imdbId?: string | null): string {
  if (!imdbId) return '';
  const cleanId = extractImdbId(imdbId) || imdbId;
  return `https://www.imdbwatch.com/title/${cleanId}/`;
}

export class ImdbWatchProvider implements PlaybackProvider {
  getName(): string {
    return 'IMDbWatch';
  }

  hasValidImdbId(title?: MediaItem | string | null): boolean {
    return hasValidImdbId(title);
  }

  buildImdbWatchUrl(imdbId?: string | null): string {
    return buildImdbWatchUrl(imdbId);
  }

  canPlay(title?: MediaItem | null, episode?: Episode | null): boolean {
    if (!title) return false;

    // For TV episodes, check episode IMDb ID or fallback to show IMDb ID
    if (episode && episode.imdbId) {
      if (hasValidImdbId(episode.imdbId)) {
        return true;
      }
    }

    return hasValidImdbId(title);
  }

  getPlaybackUrl(title?: MediaItem | null, episode?: Episode | null): string | null {
    if (!title) return null;

    // If an episode with its own IMDb ID is provided:
    if (episode && episode.imdbId) {
      const epImdbId = extractImdbId(episode.imdbId) || episode.imdbId;
      if (validateImdbId(epImdbId)) {
        return buildImdbWatchUrl(epImdbId);
      }
    }

    // Default title playback URL
    const rawId = title.imdbId || (validateImdbId(title.id) ? title.id : null);
    if (!rawId) return null;

    const imdbId = extractImdbId(rawId) || rawId;
    if (!validateImdbId(imdbId)) {
      return null;
    }

    return buildImdbWatchUrl(imdbId);
  }
}

export default ImdbWatchProvider;

