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
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/imdb-search')) {
              try {
                const urlObj = new URL(req.url, 'http://localhost:3000');
                const rawQ = urlObj.searchParams.get('q') || '';
                const trimmed = rawQ.trim();
                if (!trimmed) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ results: [] }));
                  return;
                }

                const cleaned = trimmed.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                const firstChar = cleaned[0] || 'a';
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
                  res.end(JSON.stringify({ error: 'Failed to fetch from IMDb', results: [] }));
                  return;
                }

                const data = (await upstream.json()) as any;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify(data));
                return;
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err?.message || 'Server error', results: [] }));
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
