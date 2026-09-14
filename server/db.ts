import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
let dbUrl = process.env.DATABASE_URL;

if (isVercel) {
  // If not explicitly using an external hosted database (Postgres, MySQL, Turso)
  if (!dbUrl || dbUrl.startsWith('file:')) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.resolve(process.cwd(), 'prisma', 'dev.db'),
        path.resolve(process.cwd(), 'dev.db'),
        path.resolve(__dirname, '..', 'prisma', 'dev.db'),
        path.resolve(__dirname, 'prisma', 'dev.db'),
      ];

      let copied = false;
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[FORIS DB] Successfully initialized database at ${tmpDbPath} from ${candidate}`);
            copied = true;
            break;
          } catch (err) {
            console.error(`[FORIS DB] Failed to copy candidate ${candidate}:`, err);
          }
        }
      }

      if (!copied) {
        console.warn('[FORIS DB] Notice: Seed dev.db not found in candidates, running with default schema');
      }
    }
    dbUrl = `file:${tmpDbPath}`;
  }
}

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

export const prisma = new PrismaClient({
  datasourceUrl: dbUrl,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
