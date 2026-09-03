import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'imdb-proxy',
        configureServer(server) {
          const cache = new Map<string, any>();

          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url.startsWith('/api/imdb-search') || req.url.startsWith('/api/imdb-title') || req.url.startsWith('/api/imdbwatch') || req.url.startsWith('/api/stream'))) {
              try {
                const urlObj = new URL(req.url, 'http://localhost:3000');

                // Handle in-app stream embed: /api/stream/embed?id=tt...&type=movie&s=1&e=1
                if (req.url.startsWith('/api/stream/embed')) {
                  const rawId = urlObj.searchParams.get('id') || urlObj.searchParams.get('imdbId') || '';
                  const type = (urlObj.searchParams.get('type') || 'movie').toLowerCase();
                  const season = parseInt(urlObj.searchParams.get('s') || urlObj.searchParams.get('season') || '1', 10) || 1;
                  const episode = parseInt(urlObj.searchParams.get('e') || urlObj.searchParams.get('episode') || '1', 10) || 1;

                  let cleanId = '';
                  const match = (rawId || '').match(/tt\d{7,10}/i);
                  if (match) {
                    cleanId = match[0].toLowerCase();
                  } else {
                    cleanId = 'tt6226232';
                  }

                  const isTv = type === 'tv' || type === 'series';

                  // Single unified stream source: streamimdb.ru (e.g. https://streamimdb.ru/embed/tv/tt6226232)
                  const streamSource = isTv
                    ? (season > 1 || episode > 1
                        ? `https://streamimdb.ru/embed/tv/${cleanId}/${season}/${episode}`
                        : `https://streamimdb.ru/embed/tv/${cleanId}`)
                    : `https://streamimdb.ru/embed/movie/${cleanId}`;

                  res.writeHead(302, { Location: streamSource });
                  res.end();
                  return;
                }
                
                // Handle IMDbWatch translation API: /api/imdbwatch/translate?id=tt26443597&type=movie&season=1&episode=1
                if (req.url.startsWith('/api/imdbwatch')) {
                  const rawId = urlObj.searchParams.get('id') || urlObj.searchParams.get('imdbId') || '';
                  const type = (urlObj.searchParams.get('type') || 'movie').toLowerCase();
                  const season = parseInt(urlObj.searchParams.get('season') || urlObj.searchParams.get('s') || '1', 10) || 1;
                  const episode = parseInt(urlObj.searchParams.get('episode') || urlObj.searchParams.get('e') || '1', 10) || 1;
                  const titleQuery = urlObj.searchParams.get('title') || urlObj.searchParams.get('q') || '';

                  let cleanId = '';
                  const match = (rawId || '').match(/tt\d{7,10}/i);
                  if (match) {
                    cleanId = match[0].toLowerCase();
                  } else if (titleQuery || rawId) {
                    const searchTarget = (titleQuery || rawId).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
                    const firstChar = searchTarget.startsWith('tt') ? 't' : (searchTarget[0] || 'a');
                    const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${encodeURIComponent(searchTarget)}.json`;
                    try {
                      const upstream = await fetch(imdbUrl, {
                        headers: {
                          'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                          Accept: 'application/json',
                        },
                      });
                      if (upstream.ok) {
                        const data = (await upstream.json()) as any;
                        const candidate = (data.d || []).find((it: any) => it.id && it.id.startsWith('tt'));
                        if (candidate) {
                          cleanId = candidate.id.toLowerCase();
                        }
                      }
                    } catch {}
                  }

                  // Default to provided user example or fallback
                  if (!cleanId || !cleanId.startsWith('tt')) {
                    cleanId = cleanId || 'tt6226232';
                  }

                  const isTv = type === 'tv' || type === 'series';
                  const embedUrl = isTv
                    ? (season > 1 || episode > 1
                        ? `https://streamimdb.ru/embed/tv/${cleanId}/${season}/${episode}`
                        : `https://streamimdb.ru/embed/tv/${cleanId}`)
                    : `https://streamimdb.ru/embed/movie/${cleanId}`;

                  const responseData = {
                    ok: true,
                    imdbId: cleanId,
                    type: isTv ? 'tv' : 'movie',
                    season: isTv ? season : undefined,
                    episode: isTv ? episode : undefined,
                    embedUrl,
                    imdbWatchUrl: embedUrl,
                    provider: 'streamimdb.ru',
                    providerDomain: 'streamimdb.ru',
                    timestamp: Date.now(),
                  };

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify(responseData));
                  return;
                }

                // Handle TV series full seasons and episodes lookup: /api/tv-episodes?id=tt...&title=...
                if (req.url.startsWith('/api/tv-episodes')) {
                  const rawId = urlObj.searchParams.get('id') || '';
                  const title = urlObj.searchParams.get('title') || '';
                  const match = (rawId || '').match(/tt\d{7,10}/i);
                  const cleanId = match ? match[0].toLowerCase() : '';

                  const cacheKey = `episodes:${cleanId || title.toLowerCase()}`;
                  if (cache.has(cacheKey)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify(cache.get(cacheKey)));
                    return;
                  }

                  let showId: number | null = null;

                  // 1. Try lookup by IMDb ID
                  if (cleanId) {
                    try {
                      const showRes = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${cleanId}`, {
                        redirect: 'follow',
                        headers: { 'Accept': 'application/json' },
                      });
                      if (showRes.ok) {
                        const showData = (await showRes.json()) as any;
                        if (showData && showData.id) {
                          showId = showData.id;
                        }
                      }
                    } catch (e) {
                      console.warn('TVMaze lookup error by IMDb:', e);
                    }
                  }

                  // 2. Fallback to title search if IMDb lookup failed
                  if (!showId && title) {
                    try {
                      const searchRes = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`, {
                        headers: { 'Accept': 'application/json' },
                      });
                      if (searchRes.ok) {
                        const searchData = (await searchRes.json()) as any;
                        if (searchData && searchData.id) {
                          showId = searchData.id;
                        }
                      }
                    } catch (e) {
                      console.warn('TVMaze search error by title:', e);
                    }
                  }

                  if (!showId) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify({ ok: false, seasons: [] }));
                    return;
                  }

                  // 3. Fetch all episodes for this show
                  try {
                    const epRes = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`, {
                      headers: { 'Accept': 'application/json' },
                    });
                    if (!epRes.ok) {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.setHeader('Access-Control-Allow-Origin', '*');
                      res.end(JSON.stringify({ ok: false, seasons: [] }));
                      return;
                    }

                    const rawEpisodes = (await epRes.json()) as any[];
                    if (!Array.isArray(rawEpisodes)) {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.setHeader('Access-Control-Allow-Origin', '*');
                      res.end(JSON.stringify({ ok: false, seasons: [] }));
                      return;
                    }

                    // Group episodes by season
                    const seasonsMap = new Map<number, any[]>();
                    for (const ep of rawEpisodes) {
                      const sNum = ep.season || 1;
                      const cleanSummary = (ep.summary || '').replace(/<\/?[^>]+(>|$)/g, '').trim();
                      const epObj = {
                        id: `${cleanId || 'tv'}-s${sNum}e${ep.number || 1}`,
                        imdbId: cleanId,
                        episodeNumber: ep.number || 1,
                        seasonNumber: sNum,
                        title: ep.name || `Episode ${ep.number}`,
                        duration: ep.runtime ? `${ep.runtime}m` : '50m',
                        durationSeconds: (ep.runtime || 50) * 60,
                        synopsis: cleanSummary || `Season ${sNum}, Episode ${ep.number || 1}.`,
                        releaseDate: ep.airdate || '',
                        thumbnailUrl: ep.image?.original || ep.image?.medium || '',
                        videoUrl: '',
                      };

                      if (!seasonsMap.has(sNum)) {
                        seasonsMap.set(sNum, []);
                      }
                      seasonsMap.get(sNum)!.push(epObj);
                    }

                    const seasons = Array.from(seasonsMap.entries())
                      .sort(([a], [b]) => a - b)
                      .map(([seasonNum, episodes]) => ({
                        seasonNumber: seasonNum,
                        title: `Season ${seasonNum}`,
                        episodes: episodes.sort((a, b) => a.episodeNumber - b.episodeNumber),
                      }));

                    const payload = { ok: true, seasons };
                    cache.set(cacheKey, payload);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify(payload));
                    return;
                  } catch (err) {
                    console.warn('Error fetching episodes list:', err);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify({ ok: false, seasons: [] }));
                    return;
                  }
                }

                // Handle direct IMDb ID title lookup: /api/imdb-title?id=tt1234567
                if (req.url.startsWith('/api/imdb-title')) {
                  const rawId = urlObj.searchParams.get('id') || '';
                  const cleanId = rawId.trim().toLowerCase();
                  if (!cleanId || !cleanId.startsWith('tt')) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: false, error: 'Invalid IMDb ID' }));
                    return;
                  }

                  if (cache.has(`title:${cleanId}`)) {
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end(JSON.stringify(cache.get(`title:${cleanId}`)));
                    return;
                  }

                  const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/t/${encodeURIComponent(cleanId)}.json`;
                  const upstream = await fetch(imdbUrl, {
                    headers: {
                      'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                      Accept: 'application/json',
                    },
                  });

                  if (!upstream.ok) {
                    res.statusCode = upstream.status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ ok: false, error: 'Failed to fetch title from IMDb' }));
                    return;
                  }

                  const data = (await upstream.json()) as any;
                  // Match the specific item starting with tt or matching the ID exactly (avoiding promo items like /emmys/)
                  const match = (data.d || []).find((it: any) => it.id === cleanId) || 
                                (data.d || []).find((it: any) => it.id && it.id.startsWith('tt')) ||
                                data.d?.[0];

                  const result = {
                    ok: true,
                    item: match || null,
                    posterUrl: match?.i?.imageUrl || null,
                  };

                  cache.set(`title:${cleanId}`, result);
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify(result));
                  return;
                }

                // Handle general search query
                const rawQ = urlObj.searchParams.get('q') || '';
                const trimmed = rawQ.trim();
                if (!trimmed) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ d: [], results: [] }));
                  return;
                }

                const cleaned = trimmed.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                const cacheKey = `search:${cleaned}`;
                if (cache.has(cacheKey)) {
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.end(JSON.stringify(cache.get(cacheKey)));
                  return;
                }

                const firstChar = cleaned.startsWith('tt') ? 't' : (cleaned[0] || 'a');
                const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${encodeURIComponent(cleaned)}.json`;

                const upstream = await fetch(imdbUrl, {
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    Accept: 'application/json',
                  },
                });

                if (!upstream.ok) {
                  res.statusCode = upstream.status;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Failed to fetch from IMDb', d: [], results: [] }));
                  return;
                }

                const data = (await upstream.json()) as any;
                cache.set(cacheKey, data);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify(data));
                return;
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err?.message || 'Server error', d: [], results: [] }));
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
