import { Router } from 'express';
import { listingsRouter } from '../modules/listings/listings.router';
import { taxonomyRouter } from '../modules/taxonomy/taxonomy.router';
import { exploreRouter } from '../modules/explore/explore.router';
import { locationsRouter } from '../modules/locations/locations.router';
import { aiRouter } from '../modules/ai/ai.router';
import { businessesRouter } from '../modules/businesses/businesses.router';
import { profilesRouter } from '../modules/profiles/profiles.router.ts';
import { generalApiLimiter, aiApiLimiter } from '../middleware/rateLimit.ts';
import { requireAuth } from '../middleware/auth.ts';

export const apiRouter = Router();

// Apply general API rate limiter to all /api/v1 routes
apiRouter.use(generalApiLimiter);

// Health check endpoint for readiness & liveness probes (ADR-003 & ADR-008)
apiRouter.get('/health', (req, res) => {
  return res.apiSuccess({
    status: 'healthy',
    system: 'TAROPOD Digital Textile Ecosystem',
    architecture: 'Modular Monolith v0.1',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// GET /api/v1/me - Identity & Active Authentication Context (ADR-005, Slice 02)
apiRouter.get('/me', requireAuth, (req, res) => {
  const auth = req.auth!;
  return res.apiSuccess({
    user: {
      id: auth.user.id,
      uid: auth.user.uid,
      name: auth.user.name,
      mobile: auth.user.mobile,
      email: auth.user.email,
    },
    activeBusinessId: auth.activeBusinessId || null,
    activeRole: auth.activeRole || null,
    memberships: auth.memberships || [],
  });
});

// Domain modules mounting
apiRouter.use('/profiles', profilesRouter);
apiRouter.use('/listings', listingsRouter);
apiRouter.use('/businesses', businessesRouter);
apiRouter.use('/categories', taxonomyRouter);
apiRouter.use('/taxonomy', taxonomyRouter); // Backwards compatibility
apiRouter.use('/explore', exploreRouter);
apiRouter.use('/locations', locationsRouter);
apiRouter.use('/ai', aiApiLimiter, aiRouter);

