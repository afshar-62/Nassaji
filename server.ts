import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requestContextMiddleware } from './server/middleware/context.ts';
import { authContextMiddleware, ensureSeedContext } from './server/middleware/auth.ts';
import { apiRouter } from './server/routes/api.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust reverse proxy (nginx / Cloud Run) for accurate client IP resolution
  app.set('trust proxy', 1);

  // Basic security & parsing middleware
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Attach request tracking and standard response envelopes
  app.use(requestContextMiddleware);

  // Initialize DB seed actors and attach Auth Context & Membership middleware
  try {
    await ensureSeedContext();
    console.log('[TAROPOD] Database seed actors and business memberships initialized successfully.');
  } catch (err) {
    console.warn('[TAROPOD] Warning: Could not initialize seed context on startup (may be waiting for DB proxy):', err);
  }
  app.use(authContextMiddleware);

  // Core API Boundary: Versioned domain routes (/api/v1)
  app.use('/api/v1', apiRouter);

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TAROPOD] Modular Monolith Server running at http://0.0.0.0:${PORT}`);
    console.log(`[TAROPOD] API Health Check available at http://0.0.0.0:${PORT}/api/v1/health`);
  });
}

startServer().catch((err) => {
  console.error('[TAROPOD] Fatal error starting server:', err);
  process.exit(1);
});
