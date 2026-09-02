/**
 * IMDb Metadata & Playback URL Utilities for SUBURBIA WATCH
 * Strictly implements sections 6, 7, 8, 9, 10, 17 of the playback specification.
 */

/**
 * Extracts and normalizes an IMDb ID from a raw string, IMDb URL, or mobile URL.
 * Accepts:
 *   - "tt0371746"
 *   - "https://www.imdb.com/title/tt0371746/"
 *   - "https://m.imdb.com/title/tt0371746/"
 * Internally normalizes everything to: "tt0371746"
 */
export function extractImdbId(value?: string | null): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  // Match /title/(tt\d{7,10}) or direct (tt\d{7,10})
  const urlMatch = trimmed.match(/\/title\/(tt\d{7,10})/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toLowerCase();
  }

  const directMatch = trimmed.match(/^(tt\d{7,10})$/i);
  if (directMatch && directMatch[1]) {
    return directMatch[1].toLowerCase();
  }

  // Any substring matching tt followed by 7 to 10 digits
  const anyMatch = trimmed.match(/(tt\d{7,10})/i);
  if (anyMatch && anyMatch[1]) {
    return anyMatch[1].toLowerCase();
  }

  return null;
}

/**
 * Validates an IMDb ID using the specification standard: /^tt\d{7,10}$/
 * Returns true if valid, false otherwise.
 */
export function validateImdbId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^tt\d{7,10}$/i.test(id.trim());
}

/**
 * Generates the direct IMDbWatch title playback URL.
 * Example: buildImdbWatchUrl("tt0371746") -> "https://www.imdbwatch.com/title/tt0371746/"
 *
 * CRITICAL RULE: NEVER use plugin.html for playback!
 * CORRECT: https://www.imdbwatch.com/title/tt0371746/
 * WRONG: https://imdbwatch.com/video/plugin.html
 */
export function buildImdbWatchUrl(imdbId?: string | null): string | null {
  const normalized = extractImdbId(imdbId);
  if (!normalized || !validateImdbId(normalized)) {
    return null;
  }
  return `https://www.imdbwatch.com/title/${normalized}/`;
}

/**
 * Builds the canonical IMDb reference URL for a title.
 */
export function buildImdbUrl(imdbId: string): string {
  const normalized = extractImdbId(imdbId);
  return `https://www.imdb.com/title/${normalized || imdbId}/`;
}

/**
 * Opens an external player in a secure, isolated new browser tab.
 * Respects browser security and external player guidelines.
 */
export function openExternalPlayer(playbackUrl: string): void {
  if (!playbackUrl) return;
  window.open(playbackUrl, '_blank', 'noopener,noreferrer');
}
