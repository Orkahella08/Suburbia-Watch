import { PlaybackProvider } from './PlaybackProvider';
import { OfficialPlaybackProvider } from './OfficialPlaybackProvider';
import { ImdbWatchProvider } from './ImdbWatchProvider';
import { MediaItem, Episode } from '../../types';

export class PlaybackManager {
  private providers: PlaybackProvider[];

  constructor(providers: PlaybackProvider[]) {
    this.providers = providers;
  }

  getAvailableProviders(title?: MediaItem | null, episode?: Episode | null): PlaybackProvider[] {
    return this.providers.filter((provider) => provider.canPlay(title, episode));
  }

  getDefaultProvider(title?: MediaItem | null, episode?: Episode | null): PlaybackProvider | null {
    return this.getAvailableProviders(title, episode)[0] || null;
  }

  getPlaybackUrl(
    title?: MediaItem | null,
    provider?: PlaybackProvider | null,
    episode?: Episode | null
  ): string | null {
    if (!provider) {
      return null;
    }
    return provider.getPlaybackUrl(title, episode);
  }
}

// Configured with IMDbWatch (StreamIMDb) and Official Studio Embed providers
export const defaultPlaybackManager = new PlaybackManager([
  new ImdbWatchProvider(),
  new OfficialPlaybackProvider(),
]);

