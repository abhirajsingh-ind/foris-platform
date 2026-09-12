import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

export interface AuthenticatedUser {
  id: string;
  badgeId: string;
  name: string;
  email: string;
  role: 'FORENSIC_OFFICER' | 'POLICE_OFFICER' | 'JUDGE' | 'ADMINISTRATOR';
  designation: string;
  department: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'foris_super_secure_jwt_secret_sih2026_key_!@#%&*';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No valid authorization token provided.',
        code: 'AUTH_REQUIRED',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; badgeId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        badgeId: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        department: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: User identity not found.',
        code: 'USER_NOT_FOUND',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'Account access suspended by security administrator.',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    req.user = user as AuthenticatedUser;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Your session has expired. Please authenticate again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid security session token.',
      code: 'INVALID_TOKEN',
    });
  }
}
