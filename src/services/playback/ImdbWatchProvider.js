/**
 * Validates an IMDb ID string.
 * Must match 'tt' followed by 7 to 10 digits.
 * @param {string|null|undefined} id
 * @returns {boolean}
 */
export function validateImdbId(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^tt\d{7,10}$/i.test(id.trim());
}

/**
 * Extracts and normalizes an IMDb ID from a string, URL, or mobile URL.
 * @param {string|null|undefined} value
 * @returns {string|null}
 */
export function extractImdbId(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  // Match /title/(tt\d{7,10})
  const urlMatch = trimmed.match(/\/title\/(tt\d{7,10})/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toLowerCase();
  }

  // Any substring matching tt followed by 7 to 10 digits
  const directMatch = trimmed.match(/(tt\d{7,10})/i);
  if (directMatch && directMatch[1]) {
    return directMatch[1].toLowerCase();
  }

  return null;
}

/**
 * Checks if a title or string contains a valid IMDb ID.
 * @param {any} title - Media item object or IMDb ID string
 * @returns {boolean}
 */
export function hasValidImdbId(title) {
  if (!title) return false;

  if (typeof title === 'string') {
    const extracted = extractImdbId(title) || (validateImdbId(title) ? title : null);
    return Boolean(extracted && validateImdbId(extracted));
  }

  if (typeof title === 'object') {
    const candidate =
      title.imdbId ||
      title.imdb_id ||
      title.imdbUrl ||
      title.imdb_url ||
      (validateImdbId(title.id) ? title.id : null) ||
      (title.videoUrl && extractImdbId(title.videoUrl));

    if (!candidate) return false;
    const extracted = extractImdbId(candidate) || (validateImdbId(candidate) ? candidate : null);
    return Boolean(extracted && validateImdbId(extracted));
  }

  return false;
}

/**
 * Generates the IMDbWatch playback URL for an IMDb ID.
 * @param {string} imdbId
 * @returns {string}
 */
export function buildImdbWatchUrl(imdbId) {
  if (!imdbId) return '';
  const id = typeof imdbId === 'object'
    ? (imdbId.imdbId || imdbId.imdb_id || imdbId.id || '')
    : imdbId;
  const cleanId = extractImdbId(id) || id;
  return `https://www.imdbwatch.com/title/${cleanId}/`;
}

/**
 * IMDbWatch Playback Provider
 */
export class ImdbWatchProvider {
  getName() {
    return 'IMDbWatch';
  }

  /**
   * Checks if a title has a valid IMDb ID.
   * @param {any} title
   * @returns {boolean}
   */
  hasValidImdbId(title) {
    return hasValidImdbId(title);
  }

  /**
   * Builds the IMDbWatch playback URL for an IMDb ID.
   * @param {string} imdbId
   * @returns {string}
   */
  buildImdbWatchUrl(imdbId) {
    return buildImdbWatchUrl(imdbId);
  }

  /**
   * Checks if the provider can play the specified title or episode.
   * @param {any} title
   * @param {any} [episode]
   * @returns {boolean}
   */
  canPlay(title, episode) {
    if (!title) return false;

    // For TV episodes, check episode IMDb ID or fallback to show IMDb ID
    if (episode && episode.imdbId) {
      if (hasValidImdbId(episode.imdbId)) {
        return true;
      }
    }

    return hasValidImdbId(title);
  }

  /**
   * Returns the playback URL for the specified title or episode, or null if invalid.
   * @param {any} title
   * @param {any} [episode]
   * @returns {string|null}
   */
  getPlaybackUrl(title, episode) {
    if (!title) return null;

    // If an episode with its own IMDb ID is provided:
    if (episode && episode.imdbId) {
      const epImdbId = extractImdbId(episode.imdbId) || episode.imdbId;
      if (validateImdbId(epImdbId)) {
        return buildImdbWatchUrl(epImdbId);
      }
    }

    // Check title IMDb ID
    const candidate =
      title.imdbId ||
      title.imdb_id ||
      title.imdbUrl ||
      title.imdb_url ||
      (validateImdbId(title.id) ? title.id : null);

    if (!candidate) return null;

    const imdbId = extractImdbId(candidate) || candidate;
    if (!validateImdbId(imdbId)) {
      return null;
    }

    return buildImdbWatchUrl(imdbId);
  }
}

export default ImdbWatchProvider;

