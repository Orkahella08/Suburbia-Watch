import { PlaybackProvider } from './PlaybackProvider';
import { MediaItem, Episode } from '../../types';
import { extractImdbId, validateImdbId } from '../../utils/imdb';
import { getOfficialEmbedUrl, buildOfficialWatchUrl } from '../streamingAvailabilityService';

export class OfficialPlaybackProvider implements PlaybackProvider {
  getName(): string {
    return 'Official Studio Embed';
  }

  hasValidImdbId(title?: MediaItem | string | null): boolean {
    if (!title) return false;
    if (typeof title === 'string') {
      const extracted = extractImdbId(title) || (validateImdbId(title) ? title : null);
      return Boolean(extracted && validateImdbId(extracted));
    }
    const candidate = title.imdbId || (validateImdbId(title.id) ? title.id : null);
    if (!candidate) return false;
    const extracted = extractImdbId(candidate) || (validateImdbId(candidate) ? candidate : null);
    return Boolean(extracted && validateImdbId(extracted));
  }

  canPlay(title?: MediaItem | null, episode?: Episode | null): boolean {
    if (!title) return false;
    return Boolean(title.imdbId || title.id || (episode && episode.imdbId));
  }

  getPlaybackUrl(title?: MediaItem | null, episode?: Episode | null): string | null {
    if (!title) return null;
    return getOfficialEmbedUrl(title);
  }

  getOfficialWatchUrl(title: MediaItem, providerName?: string): string {
    return buildOfficialWatchUrl(
      (providerName as any) || 'Netflix',
      title.title,
      title.imdbId
    );
  }
}
