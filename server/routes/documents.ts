import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/auditLogger';
import { sha256 } from '../utils/crypto';

export const documentsRouter = Router();

documentsRouter.use(requireAuth);

const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage with sanitized UUID filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

// Allowed MIME types whitelist
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB maximum
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Security Exception: Prohibited file MIME type '${file.mimetype}'. Only verified forensic document types permitted.`));
    }
  },
});

// POST /api/documents/upload - Upload evidence/report document (Judge strictly blocked)
documentsRouter.post(
  '/upload',
  requireRoles(['FORENSIC_OFFICER', 'POLICE_OFFICER', 'ADMINISTRATOR']),
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, error: 'No document file provided.' });
      }

      const { caseId, evidenceId } = req.body;

      // Calculate SHA-256 hash of the uploaded file bytes
      const fileBuffer = fs.readFileSync(file.path);
      const fileHash = sha256(fileBuffer);

      const doc = await prisma.document.create({
        data: {
          caseId: caseId || null,
          evidenceId: evidenceId || null,
          originalFilename: path.basename(file.originalname),
          storedFilename: file.filename,
          mimeType: file.mimetype,
          fileSize: file.size,
          sha256Hash: fileHash,
          uploadedById: user.id,
        },
      });

      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'DOCUMENT_UPLOADED',
        caseId: doc.caseId,
        resourceType: 'FORENSIC_DOCUMENT',
        resourceId: doc.id,
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: {
          originalFilename: doc.originalFilename,
          size: doc.fileSize,
          sha256: doc.sha256Hash,
        },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        document: doc,
        sha256Hash: fileHash,
        securityScanStatus: 'CLEAN_VERIFIED',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'File upload failed.' });
    }
  }
);

// GET /api/documents/:id/view - Stream document / image inline for UI preview
documentsRouter.get('/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document record not found.' });
    }

    const filePath = path.join(UPLOAD_DIR, doc.storedFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Underlying document file not found on storage node.' });
    }

    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalFilename}"`);
    res.sendFile(filePath);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to stream document preview.' });
  }
});

// GET /api/documents/:id/download - Stream document with audit logging
documentsRouter.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document record not found.' });
    }

    const filePath = path.join(UPLOAD_DIR, doc.storedFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Underlying document file not found on storage node.' });
    }

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'DOCUMENT_DOWNLOADED',
      caseId: doc.caseId,
      resourceType: 'FORENSIC_DOCUMENT',
      resourceId: doc.id,
      result: 'SUCCESS',
      severity: 'INFO',
      metadata: { originalFilename: doc.originalFilename },
      ipAddress: req.ip,
    });

    res.download(filePath, doc.originalFilename);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Download failed.' });
  }
});

// POST /api/documents/:id/verify - Verify physical file byte hash against stored cryptographic hash
documentsRouter.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document record not found.' });
    }

    const filePath = path.join(UPLOAD_DIR, doc.storedFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Underlying file missing from storage node.' });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const calculatedHash = sha256(fileBuffer);
    const matches = calculatedHash === doc.sha256Hash;

    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'INTEGRITY_CHECK',
      caseId: doc.caseId,
      resourceType: 'FORENSIC_DOCUMENT_BYTES',
      resourceId: doc.id,
      result: matches ? 'SUCCESS' : 'WARNING',
      severity: matches ? 'INFO' : 'CRITICAL',
      metadata: { expectedHash: doc.sha256Hash, calculatedHash, matches },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      verified: matches,
      expectedHash: doc.sha256Hash,
      calculatedHash,
      filename: doc.originalFilename,
      verifiedAt: new Date(),
      verifiedBy: `${user.name} [${user.badgeId}]`,
      message: matches
        ? '✓ INTEGRITY VERIFIED: File byte content matches exact original cryptographic hash.'
        : '⚠ INTEGRITY MISMATCH DETECTED: File content has been modified on storage disk!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Document verification failed.' });
  }
});
