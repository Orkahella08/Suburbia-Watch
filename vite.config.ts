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
