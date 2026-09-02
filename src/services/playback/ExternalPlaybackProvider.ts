import { PlaybackProvider } from './PlaybackProvider';
import { MediaItem, Episode } from '../../types';
import { extractImdbId, validateImdbId, buildImdbWatchUrl } from '../../utils/imdb';

export class ExternalPlaybackProvider implements PlaybackProvider {
  getName(): string {
    return 'External Player';
  }

  canPlay(title?: MediaItem | null, episode?: Episode | null): boolean {
    if (!title) return false;
    if (episode?.imdbId && validateImdbId(extractImdbId(episode.imdbId))) {
      return true;
    }
    const imdbId = extractImdbId(title.imdbId);
    return Boolean(imdbId && validateImdbId(imdbId));
  }

  getPlaybackUrl(title?: MediaItem | null, episode?: Episode | null): string | null {
    if (!title) return null;
    if (episode?.imdbId) {
      const epImdbId = extractImdbId(episode.imdbId);
      if (epImdbId && validateImdbId(epImdbId)) {
        return buildImdbWatchUrl(epImdbId);
      }
    }
    const imdbId = extractImdbId(title.imdbId);
    if (!imdbId || !validateImdbId(imdbId)) return null;
    return buildImdbWatchUrl(imdbId);
  }
}
