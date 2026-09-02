import { MediaItem, Episode } from '../../types';

export interface PlaybackProvider {
  getName(): string;
  canPlay(title?: MediaItem | null, episode?: Episode | null): boolean;
  getPlaybackUrl(title?: MediaItem | null, episode?: Episode | null): string | null;
}
