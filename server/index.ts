import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { casesRouter } from './routes/cases';
import { evidenceRouter } from './routes/evidence';
import { reportsRouter } from './routes/reports';
import { auditRouter } from './routes/audit';
import { securityRouter } from './routes/security';
import { documentsRouter } from './routes/documents';
import { searchRouter } from './routes/search';
import { samadhaanRouter } from './routes/samadhaan';
import { errorHandler } from './middleware/errorHandler';

const isTestEnv = process.env.NODE_ENV === 'test' || process.argv.some((a) => a.includes('test'));
dotenv.config();
if (isTestEnv) {
  process.env.NODE_ENV = 'test';
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline styles/scripts needed in development
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow any origin for Vercel/cloud deployments or local development
      callback(null, true);
    },
    credentials: true,
  })
);

// Payload size restrictions (prevents DOS via large payload)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting on sensitive authentication gateways
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts from this network address. Please wait 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

app.use(['/api/auth/login', '/auth/login'], authLimiter);

// Health check
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'FORIS — Forensic Integrity & Evidence System',
    timestamp: new Date(),
    architecture: 'Defense-in-Depth Government-Grade Forensic Core',
  });
});

// Mount Routes (supporting both /api/* and direct subpaths for Vercel serverless routing)
app.use(['/api/auth', '/auth'], authRouter);
app.use(['/api/cases', '/cases'], casesRouter);
app.use(['/api/evidence', '/evidence'], evidenceRouter);
app.use(['/api/reports', '/reports'], reportsRouter);
app.use(['/api/audit', '/audit'], auditRouter);
app.use(['/api/security', '/security'], securityRouter);
app.use(['/api/documents', '/documents'], documentsRouter);
app.use(['/api/search', '/search'], searchRouter);
app.use(['/api/ai/samadhaan', '/ai/samadhaan'], samadhaanRouter);

// Serve static frontend build if present
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res, next) => {
  if (_req.originalUrl.startsWith('/api') || _req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In dev mode or serverless execution when static is not co-located
      res.status(404).send('FORIS API Server Running.');
    }
  });
});

// Centralized error handler
app.use(errorHandler);

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
if (process.env.NODE_ENV !== 'test' && !isTestEnv && !isVercel) {
  app.listen(PORT, () => {
    console.log(`[FORIS SERVER] Forensic Core online on port ${PORT}`);
    console.log(`[FORIS SERVER] Defense-in-depth security active`);
  });
}

export default app;
