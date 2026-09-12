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
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

app.use('/api/auth/login', authLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'FORIS — Forensic Integrity & Evidence System',
    timestamp: new Date(),
    architecture: 'Defense-in-Depth Government-Grade Forensic Core',
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/security', securityRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/search', searchRouter);
app.use('/api/ai/samadhaan', samadhaanRouter);

// Serve static frontend build if present
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res, next) => {
  if (_req.originalUrl.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // In dev mode when client is served by Vite on port 5173
      res.status(404).send('FORIS API Server Running. Frontend available at http://localhost:5173');
    }
  });
});

// Centralized error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test' && !isTestEnv) {
  app.listen(PORT, () => {
    console.log(`[FORIS SERVER] Forensic Core online on port ${PORT}`);
    console.log(`[FORIS SERVER] Defense-in-depth security active`);
  });
}

export default app;
