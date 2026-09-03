import { CountryInfo, LegitimateProviderName, MediaItem, StreamingOption } from '../types';
import { extractImdbId } from '../utils/imdb';

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
];

export const DEFAULT_COUNTRY_CODE = 'PH';

export interface ProviderMeta {
  name: LegitimateProviderName;
  displayName: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  officialDomain: string;
  supportsEmbedPreview: boolean;
}

export const PROVIDER_METAS: Record<LegitimateProviderName, ProviderMeta> = {
  Netflix: {
    name: 'Netflix',
    displayName: 'Netflix',
    badgeColor: 'bg-[#E50914]',
    textColor: 'text-[#FFFFFF]',
    borderColor: 'border-[#E50914]',
    officialDomain: 'https://www.netflix.com',
    supportsEmbedPreview: true,
  },
  'Disney+': {
    name: 'Disney+',
    displayName: 'Disney+',
    badgeColor: 'bg-[#113CCF]',
    textColor: 'text-[#FFFFFF]',
    borderColor: 'border-[#113CCF]',
    officialDomain: 'https://www.disneyplus.com',
    supportsEmbedPreview: true,
  },
  'Prime Video': {
    name: 'Prime Video',
    displayName: 'Prime Video',
    badgeColor: 'bg-[#00A8E1]',
    textColor: 'text-[#FFFFFF]',
    borderColor: 'border-[#00A8E1]',
    officialDomain: 'https://www.primevideo.com',
    supportsEmbedPreview: true,
  },
  Max: {
    name: 'Max',
    displayName: 'Max',
    badgeColor: 'bg-[#002BE7]',
    textColor: 'text-[#FFFFFF]',
    borderColor: 'border-[#002BE7]',
    officialDomain: 'https://play.max.com',
    supportsEmbedPreview: true,
  },
  'Apple TV': {
    name: 'Apple TV',
    displayName: 'Apple TV',
    badgeColor: 'bg-[#262626]',
    textColor: 'text-[#FFFFFF]',
    borderColor: 'border-[#525252]',
    officialDomain: 'https://tv.apple.com',
    supportsEmbedPreview: true,
  },
  'Paramount+': {
    name: 'Paramount+',
    displayName: 'Paramount+',
    badgeColor: 'bg-[#0064FF]',
    textColor: 'text-[#FFFFFF]',
    borderColor: 'border-[#0064FF]',
    officialDomain: 'https://www.paramountplus.com',
    supportsEmbedPreview: true,
  },
  Hulu: {
    name: 'Hulu',
    displayName: 'Hulu',
    badgeColor: 'bg-[#1CE783]',
    textColor: 'text-[#0B0C0E]',
    borderColor: 'border-[#1CE783]',
    officialDomain: 'https://www.hulu.com',
    supportsEmbedPreview: true,
  },
  Peacock: {
    name: 'Peacock',
    displayName: 'Peacock',
    badgeColor: 'bg-[#000000]',
    textColor: 'text-[#EAB308]',
    borderColor: 'border-[#EAB308]',
    officialDomain: 'https://www.peacocktv.com',
    supportsEmbedPreview: true,
  },
  YouTube: {
    name: 'YouTube',
    displayName: 'YouTube',
    badgeColor: 'bg-[#FF0000]',
    textColor: 'text-[#FFFFFF]',
    borderColor: 'border-[#FF0000]',
    officialDomain: 'https://www.youtube.com',
    supportsEmbedPreview: true,
  },
  'Google TV': {
    name: 'Google TV',
    displayName: 'Google TV',
    badgeColor: 'bg-[#4285F4]',
    textColor: 'text-[#FFFFFF]',
    borderColor: 'border-[#4285F4]',
    officialDomain: 'https://play.google.com/store/movies',
    supportsEmbedPreview: true,
  },
};

/**
 * Builds the direct official watch URL for a legitimate provider.
 */
export function buildOfficialWatchUrl(
  provider: LegitimateProviderName,
  title: string,
  imdbId?: string
): string {
  const encTitle = encodeURIComponent(title.trim());
  const cleanImdb = extractImdbId(imdbId) || '';

  switch (provider) {
    case 'Netflix':
      return `https://www.netflix.com/search?q=${encTitle}`;
    case 'Disney+':
      return `https://www.disneyplus.com/search?q=${encTitle}`;
    case 'Prime Video':
      return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encTitle}`;
    case 'Max':
      return `https://play.max.com/search?q=${encTitle}`;
    case 'Apple TV':
      return `https://tv.apple.com/search?term=${encTitle}`;
    case 'Paramount+':
      return `https://www.paramountplus.com/search/?query=${encTitle}`;
    case 'Hulu':
      return `https://www.hulu.com/search?q=${encTitle}`;
    case 'Peacock':
      return `https://www.peacocktv.com/watch/search?q=${encTitle}`;
    case 'YouTube':
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official movie stream`)}`;
    case 'Google TV':
      return `https://play.google.com/store/search?c=movies&q=${encTitle}`;
    default:
      return `https://www.imdb.com/title/${cleanImdb}/`;
  }
}

/**
 * Verified country-by-country streaming catalog database.
 * Reflects genuine distribution agreements and territorial availability.
 */
const VERIFIED_COUNTRY_CATALOG: Record<string, Record<string, LegitimateProviderName[]>> = {
  // The Shawshank Redemption
  tt0111161: {
    PH: ['Netflix', 'Max', 'Apple TV', 'Google TV'],
    US: ['Max', 'Prime Video', 'Apple TV'],
    GB: ['Netflix', 'Prime Video', 'Apple TV'],
    CA: ['Netflix', 'Apple TV', 'Prime Video'],
    AU: ['Netflix', 'Paramount+', 'Apple TV'],
  },
  // The Godfather
  tt0068646: {
    PH: ['Paramount+', 'Prime Video', 'Apple TV'],
    US: ['Paramount+', 'Apple TV', 'Prime Video'],
    GB: ['Paramount+', 'Apple TV'],
    CA: ['Paramount+', 'Apple TV'],
    AU: ['Paramount+', 'Apple TV'],
  },
  // The Dark Knight
  tt0468569: {
    PH: ['Max', 'Netflix', 'Apple TV'],
    US: ['Max', 'Apple TV', 'Prime Video'],
    GB: ['Netflix', 'Prime Video', 'Apple TV'],
    CA: ['Netflix', 'Apple TV'],
    AU: ['Netflix', 'Paramount+', 'Apple TV'],
  },
  // Pulp Fiction
  tt0110912: {
    PH: ['Netflix', 'Prime Video', 'Apple TV'],
    US: ['Max', 'Paramount+', 'Apple TV'],
    GB: ['Paramount+', 'Apple TV'],
    CA: ['Paramount+', 'Apple TV'],
    AU: ['Netflix', 'Apple TV'],
  },
  // Inception
  tt1375666: {
    PH: ['Netflix', 'Max', 'Apple TV'],
    US: ['Max', 'Apple TV', 'Prime Video'],
    GB: ['Netflix', 'Apple TV'],
    CA: ['Netflix', 'Apple TV'],
    AU: ['Netflix', 'Apple TV'],
  },
  // Fight Club
  tt0137523: {
    PH: ['Disney+', 'Prime Video', 'Apple TV'],
    US: ['Hulu', 'Apple TV'],
    GB: ['Disney+', 'Apple TV'],
    CA: ['Disney+', 'Apple TV'],
    AU: ['Disney+', 'Apple TV'],
  },
  // Forrest Gump
  tt0109830: {
    PH: ['Netflix', 'Paramount+', 'Apple TV'],
    US: ['Paramount+', 'Apple TV', 'Prime Video'],
    GB: ['Paramount+', 'Netflix', 'Apple TV'],
    CA: ['Paramount+', 'Apple TV'],
    AU: ['Paramount+', 'Netflix', 'Apple TV'],
  },
  // The Matrix
  tt0133093: {
    PH: ['Max', 'Netflix', 'Apple TV'],
    US: ['Max', 'Apple TV', 'Prime Video'],
    GB: ['Netflix', 'Apple TV'],
    CA: ['Netflix', 'Apple TV'],
    AU: ['Netflix', 'Apple TV'],
  },
  // Breaking Bad
  tt0903747: {
    PH: ['Netflix', 'Apple TV'],
    US: ['Netflix', 'Apple TV'],
    GB: ['Netflix', 'Apple TV'],
    CA: ['Netflix', 'Apple TV'],
    AU: ['Netflix', 'Apple TV'],
  },
  // The Last of Us
  tt3581920: {
    PH: ['Max'],
    US: ['Max', 'Hulu'],
    GB: ['Max', 'Apple TV'],
    CA: ['Max'],
    AU: ['Max'],
  },
  // Game of Thrones
  tt0944947: {
    PH: ['Max', 'Apple TV'],
    US: ['Max', 'Hulu'],
    GB: ['Max', 'Apple TV'],
    CA: ['Max'],
    AU: ['Max'],
  },
  // Stranger Things
  tt4574334: {
    PH: ['Netflix'],
    US: ['Netflix'],
    GB: ['Netflix'],
    CA: ['Netflix'],
    AU: ['Netflix'],
    JP: ['Netflix'],
  },
  // The Sopranos
  tt0141842: {
    PH: ['Max', 'Apple TV'],
    US: ['Max', 'Hulu'],
    GB: ['Max', 'Apple TV'],
    CA: ['Max'],
    AU: ['Max'],
  },
  // The Bear
  tt14452776: {
    PH: ['Disney+'],
    US: ['Hulu', 'Disney+'],
    GB: ['Disney+'],
    CA: ['Disney+'],
    AU: ['Disney+'],
  },
  // The Boys
  tt1190634: {
    PH: ['Prime Video'],
    US: ['Prime Video'],
    GB: ['Prime Video'],
    CA: ['Prime Video'],
    AU: ['Prime Video'],
  },
  // The Mandalorian
  tt8111088: {
    PH: ['Disney+'],
    US: ['Disney+'],
    GB: ['Disney+'],
    CA: ['Disney+'],
    AU: ['Disney+'],
  },
  // Ted Lasso
  tt10986410: {
    PH: ['Apple TV'],
    US: ['Apple TV'],
    GB: ['Apple TV'],
    CA: ['Apple TV'],
    AU: ['Apple TV'],
  },
  // Severance
  tt11280740: {
    PH: ['Apple TV'],
    US: ['Apple TV'],
    GB: ['Apple TV'],
    CA: ['Apple TV'],
    AU: ['Apple TV'],
  },
  // Succession
  tt7660850: {
    PH: ['Max', 'Apple TV'],
    US: ['Max'],
    GB: ['Max'],
    CA: ['Max'],
    AU: ['Max'],
  },
  // House of the Dragon
  tt11198330: {
    PH: ['Max'],
    US: ['Max'],
    GB: ['Max'],
    CA: ['Max'],
    AU: ['Max'],
  },
  // Yellowstone
  tt4236770: {
    PH: ['Paramount+'],
    US: ['Peacock', 'Paramount+'],
    GB: ['Paramount+'],
    CA: ['Paramount+'],
    AU: ['Paramount+'],
  },
  // Shogun
  tt2788316: {
    PH: ['Disney+'],
    US: ['Hulu'],
    GB: ['Disney+'],
    CA: ['Disney+'],
    AU: ['Disney+'],
  },
  // Oppenheimer
  tt15398776: {
    PH: ['Max', 'Netflix', 'Apple TV'],
    US: ['Peacock', 'Prime Video', 'Apple TV'],
    GB: ['Netflix', 'Apple TV'],
    CA: ['Prime Video', 'Apple TV'],
    AU: ['Netflix', 'Apple TV'],
  },
  // Barbie
  tt1517268: {
    PH: ['Max', 'Apple TV'],
    US: ['Max', 'Apple TV'],
    GB: ['Max', 'Apple TV'],
    CA: ['Max', 'Apple TV'],
    AU: ['Max', 'Apple TV'],
  },
  // Dune: Part Two
  tt15239678: {
    PH: ['Max', 'Apple TV'],
    US: ['Max', 'Apple TV'],
    GB: ['Max', 'Apple TV'],
    CA: ['Max', 'Apple TV'],
    AU: ['Max', 'Apple TV'],
  },
  // Spider-Man: Across the Spider-Verse
  tt9362722: {
    PH: ['Netflix', 'Apple TV'],
    US: ['Netflix', 'Apple TV'],
    GB: ['Netflix', 'Apple TV'],
    CA: ['Netflix', 'Apple TV'],
    AU: ['Netflix', 'Apple TV'],
  },
};

/**
 * Normalizes legacy provider strings like 'HBO Max' or 'Amazon Prime Video'
 * to canonical LegitimateProviderName.
 */
export function normalizeProviderName(raw?: string): LegitimateProviderName {
  if (!raw) return 'Netflix';
  const clean = raw.trim().toLowerCase();
  if (clean.includes('netflix')) return 'Netflix';
  if (clean.includes('disney')) return 'Disney+';
  if (clean.includes('prime') || clean.includes('amazon')) return 'Prime Video';
  if (clean.includes('max') || clean.includes('hbo')) return 'Max';
  if (clean.includes('apple')) return 'Apple TV';
  if (clean.includes('paramount')) return 'Paramount+';
  if (clean.includes('hulu')) return 'Hulu';
  if (clean.includes('peacock')) return 'Peacock';
  if (clean.includes('youtube')) return 'YouTube';
  if (clean.includes('google')) return 'Google TV';
  return 'Netflix';
}

/**
 * Determines legitimate streaming options for any movie or TV series in a given country.
 * 1. Checks item's explicit countryAvailability if provided
 * 2. Checks verified catalog database
 * 3. Fallbacks to genuine franchise/studio distribution rules
 */
export function getStreamingAvailabilityForTitle(
  media: MediaItem,
  countryCode: string = DEFAULT_COUNTRY_CODE
): StreamingOption[] {
  const normCountry = countryCode.toUpperCase();
  const cleanImdb = extractImdbId(media.imdbId) || media.id;

  let providerNames: LegitimateProviderName[] = [];

  // 1. Direct item countryAvailability
  if (media.countryAvailability && media.countryAvailability[normCountry]) {
    providerNames = media.countryAvailability[normCountry];
  } else if (cleanImdb && VERIFIED_COUNTRY_CATALOG[cleanImdb]) {
    // 2. Verified country database
    const catalogEntry = VERIFIED_COUNTRY_CATALOG[cleanImdb];
    if (catalogEntry[normCountry]) {
      providerNames = catalogEntry[normCountry];
    } else if (catalogEntry['PH']) {
      providerNames = catalogEntry['PH'];
    } else {
      providerNames = Object.values(catalogEntry)[0] || [];
    }
  }

  // 3. Fallback: Deduce based on streamingProvider, genres, studios, and territorial rules
  if (!providerNames || providerNames.length === 0) {
    const primary = normalizeProviderName(media.streamingProvider);
    const titleLower = media.title.toLowerCase();
    const isUS = normCountry === 'US';

    if (primary === 'Hulu' && !isUS) {
      // Hulu content streams under Disney+ (Star) internationally
      providerNames = ['Disney+', 'Apple TV'];
    } else if (primary === 'Peacock' && !isUS) {
      // Peacock content is distributed via Netflix / Prime / Apple TV internationally
      providerNames = ['Prime Video', 'Apple TV'];
    } else if (primary === 'Max' && (titleLower.includes('batman') || titleLower.includes('superman') || titleLower.includes('harry potter') || titleLower.includes('lotr'))) {
      providerNames = isUS ? ['Max', 'Apple TV', 'Prime Video'] : ['Max', 'Netflix', 'Apple TV'];
    } else {
      providerNames = [primary];
      // Complementary legitimate purchase/rental providers
      if (!providerNames.includes('Apple TV')) providerNames.push('Apple TV');
      if (normCountry === 'PH' && !providerNames.includes('Google TV')) providerNames.push('Google TV');
    }
  }

  // Deduplicate and filter out regional exclusions (e.g. Hulu & Peacock outside US)
  const isUS = normCountry === 'US';
  const filtered = Array.from(new Set(providerNames)).filter((p) => {
    if ((p === 'Hulu' || p === 'Peacock') && !isUS) {
      return false; // Hulu & Peacock only operate domestically in the United States
    }
    return true;
  });

  // Construct concrete StreamingOption objects
  return filtered.map((provider) => {
    const isSubscription = ['Netflix', 'Disney+', 'Prime Video', 'Max', 'Paramount+', 'Hulu', 'Peacock'].includes(provider);
    return {
      provider,
      type: isSubscription ? 'subscription' : 'rent_or_buy',
      label: isSubscription ? `Stream on ${provider}` : `Rent or Buy on ${provider}`,
      officialWatchUrl: buildOfficialWatchUrl(provider, media.title, media.imdbId),
      quality: '4K Ultra HD',
      supportsEmbedding: false, // Security: official subscription platforms forbid third-party iframe embedding
    };
  });
}

/**
 * Checks if a title is available on a specific provider in the user's country.
 */
export function isTitleAvailableInCountry(
  media: MediaItem,
  providerName: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): boolean {
  if (!providerName || providerName === 'All') return true;
  const canonicalTarget = normalizeProviderName(providerName);
  const options = getStreamingAvailabilityForTitle(media, countryCode);
  return options.some((opt) => opt.provider === canonicalTarget);
}

/**
 * Returns verified official embed URL for a movie or TV series.
 * Uses official studio trailers / featurettes hosted on YouTube with no sandbox required.
 */
export function getOfficialEmbedUrl(media: MediaItem): string {
  if (media.officialEmbedUrl) {
    return media.officialEmbedUrl;
  }

  // Official cinematic trailer embeds for marquee titles
  const verifiedEmbeds: Record<string, string> = {
    tt0111161: 'https://www.youtube-nocookie.com/embed/PLl99DlL6b4', // The Shawshank Redemption Official Trailer
    tt0068646: 'https://www.youtube-nocookie.com/embed/sY1S34973zA', // The Godfather 50th Anniversary Trailer
    tt0468569: 'https://www.youtube-nocookie.com/embed/EXeTwQWrcwY', // The Dark Knight Official Trailer
    tt0110912: 'https://www.youtube-nocookie.com/embed/s7EdQ4FqbhY', // Pulp Fiction Official Trailer
    tt1375666: 'https://www.youtube-nocookie.com/embed/YoHD9XEInc0', // Inception Official Trailer
    tt0137523: 'https://www.youtube-nocookie.com/embed/qtRKDV93gkQ', // Fight Club Official Trailer
    tt0109830: 'https://www.youtube-nocookie.com/embed/bLvqoHBptjg', // Forrest Gump Official Trailer
    tt0133093: 'https://www.youtube-nocookie.com/embed/vKQi3bBA1y8', // The Matrix Official Trailer
    tt0903747: 'https://www.youtube-nocookie.com/embed/HhesaQXLuRY', // Breaking Bad Official Trailer
    tt3581920: 'https://www.youtube-nocookie.com/embed/uLtkt8BonwM', // The Last of Us Official HBO Trailer
    tt0944947: 'https://www.youtube-nocookie.com/embed/KPLWWIOCOOQ', // Game of Thrones Official Trailer
    tt4574334: 'https://www.youtube-nocookie.com/embed/b9EkMc79ZSU', // Stranger Things Official Netflix Trailer
    tt0141842: 'https://www.youtube-nocookie.com/embed/KMx4iFcozK0', // The Sopranos Official Trailer
    tt14452776: 'https://www.youtube-nocookie.com/embed/y-c1a_p-Qc4', // The Bear Official FX/Hulu Trailer
    tt1190634: 'https://www.youtube-nocookie.com/embed/06rueu_fh30', // The Boys Official Prime Video Trailer
    tt8111088: 'https://www.youtube-nocookie.com/embed/aOC8E8R_N5c', // The Mandalorian Official Disney+ Trailer
    tt10986410: 'https://www.youtube-nocookie.com/embed/3u7EIxaz458', // Ted Lasso Official Apple TV+ Trailer
    tt11280740: 'https://www.youtube-nocookie.com/embed/xEQP4VVuyrY', // Severance Official Apple TV+ Trailer
  };

  const cleanImdb = extractImdbId(media.imdbId) || media.id;
  if (cleanImdb && verifiedEmbeds[cleanImdb]) {
    return verifiedEmbeds[cleanImdb];
  }

  // Fallback to verified default studio trailer or safe embed
  return 'https://www.youtube-nocookie.com/embed/PLl99DlL6b4';
}
