export type MediaType = 'movie' | 'tv';

export type NavTab = 'home' | 'movies' | 'tv' | 'genres' | 'providers' | 'search' | 'watchlist';

export type LegitimateProviderName =
  | 'Netflix'
  | 'Disney+'
  | 'Prime Video'
  | 'Max'
  | 'Apple TV'
  | 'Paramount+'
  | 'Hulu'
  | 'Peacock'
  | 'YouTube'
  | 'Google TV';

export type StreamingProvider =
  | LegitimateProviderName
  | 'HBO Max'
  | 'Amazon Prime Video'
  | 'Apple TV+'
  | 'Viu';

export interface CountryInfo {
  code: string; // 'PH', 'US', etc.
  name: string; // 'Philippines', 'United States', etc.
  flag: string; // '🇵🇭', '🇺🇸', etc.
}

export interface StreamingOption {
  provider: LegitimateProviderName;
  type: 'subscription' | 'free' | 'rent_or_buy';
  label: string;
  officialWatchUrl: string;
  quality?: string;
  price?: string;
  embedUrl?: string;
  supportsEmbedding?: boolean;
}

export interface StreamingAvailabilityResult {
  imdbId: string;
  countryCode: string;
  countryName: string;
  options: StreamingOption[];
}

export interface CastMember {
  name: string;
  role: string; // Character name
  avatar?: string;
  bio?: string;
  knownFor?: string[];
}

export interface Episode {
  id: string;
  imdbId?: string; // e.g. "tt4593118"
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  duration: string;
  durationSeconds: number;
  synopsis: string;
  releaseDate?: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export type PlayerState = 'loading' | 'ready' | 'error' | 'external';

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  imdbId: string; // e.g. "tt1877830"
  title: string;
  type: MediaType;
  tagline?: string;
  synopsis: string;
  backdropUrl: string; // 16:9 cinematic aspect ratio
  posterUrl: string; // 2:3 portrait aspect ratio
  releaseYear: number;
  releaseDate?: string;
  communityRating: number; // e.g. 96 (%)
  imdbRating: number; // e.g. 8.8 / 10
  maturityRating: string; // 'PG-13' | 'TV-MA' | 'R' | 'PG'
  duration?: string; // For movies e.g. '2H 56M'
  seasonsCount?: number; // For TV
  durationSeconds?: number;
  genres: string[];
  director: string;
  writer: string;
  country: string;
  streamingProvider: StreamingProvider;
  availableProviders?: StreamingProvider[];
  countryAvailability?: Record<string, LegitimateProviderName[]>;
  officialEmbedUrl?: string;
  cast: CastMember[];
  videoUrl: string; // Fallback / preview stream
  seasons?: Season[];
  featured?: boolean;
  popular?: boolean;
  newRelease?: boolean;
  criticallyAcclaimed?: boolean;
  trending?: boolean;
  neighborhoodBadge?: string;
}

export interface WatchProgress {
  mediaId: string;
  imdbId: string;
  title: string;
  type: MediaType;
  episodeId?: string;
  episodeTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  progressSeconds: number;
  totalSeconds: number;
  formattedTime?: string;
  updatedAt: number;
}
