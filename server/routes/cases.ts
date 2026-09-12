import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { requireRoles } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/auditLogger';

export const casesRouter = Router();

// Apply auth to all case routes
casesRouter.use(requireAuth);

// GET /api/cases - List cases with role-aware visibility
casesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { status, priority, search } = req.query;

    const where: any = {};

    // Search query filter
    if (search && typeof search === 'string') {
      const q = search.trim();
      where.OR = [
        { id: { contains: q } },
        { firNumber: { contains: q } },
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      where.priority = priority;
    }

    // Role-based visibility scoping:
    // If Forensic Officer, show assigned cases and cases in their forensic laboratory
    if (user.role === 'FORENSIC_OFFICER') {
      // In SIH demo, show cases where assigned or in unit
      where.OR = [
        ...(where.OR || []),
        { assignedOfficerId: user.id },
        { forensicUnit: { contains: 'Forensic' } },
      ];
    }

    const cases = await prisma.case.findMany({
      where,
      include: {
        assignedOfficer: {
          select: { id: true, badgeId: true, name: true, designation: true },
        },
        _count: {
          select: { evidence: true, reports: true, documents: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      cases,
      total: cases.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve case portfolio.' });
  }
});

// GET /api/cases/:id - Retrieve specific case dossier with evidence, reports & attached documents/photos
casesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const forensicCase = await prisma.case.findUnique({
      where: { id },
      include: {
        assignedOfficer: {
          select: { id: true, badgeId: true, name: true, designation: true, department: true },
        },
        createdBy: {
          select: { id: true, badgeId: true, name: true },
        },
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        evidence: {
          include: {
            transfers: {
              include: {
                responsibleOfficer: {
                  select: { id: true, badgeId: true, name: true, designation: true },
                },
              },
              orderBy: { transferredAt: 'asc' },
            },
          },
        },
        reports: {
          include: {
            author: {
              select: { id: true, badgeId: true, name: true, designation: true },
            },
            versions: {
              orderBy: { versionNumber: 'desc' },
            },
          },
        },
      },
    });

    if (!forensicCase) {
      return res.status(404).json({ success: false, error: 'Case identifier not found in registry.' });
    }

    // Log case dossier inspection
    await logAuditEvent({
      userId: user.id,
      userBadge: user.badgeId,
      userName: user.name,
      role: user.role,
      action: 'CASE_VIEWED',
      caseId: forensicCase.id,
      resourceType: 'CASE_DOSSIER',
      resourceId: forensicCase.id,
      result: 'SUCCESS',
      severity: 'INFO',
      metadata: { caseTitle: forensicCase.title },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      case: forensicCase,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to load case details.' });
  }
});

// POST /api/cases - Register a new case (Forensic Officer or Police Officer only; Judge strictly blocked)
casesRouter.post(
  '/',
  requireRoles(['FORENSIC_OFFICER', 'POLICE_OFFICER', 'ADMINISTRATOR']),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { id, firNumber, title, description, category, policeUnit, forensicUnit, priority } = req.body;

      if (!id || !firNumber || !title || !category) {
        return res.status(400).json({
          success: false,
          error: 'Missing required case fields: Case ID, FIR Number, Title, and Category are mandatory.',
        });
      }

      // Check unique Case ID
      const existing = await prisma.case.findUnique({ where: { id } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Case ID '${id}' is already registered in the court registry.`,
        });
      }

      const newCase = await prisma.case.create({
        data: {
          id: id.trim().toUpperCase(),
          firNumber: firNumber.trim(),
          title: title.trim(),
          description: description ? description.trim() : 'Case dossier created.',
          category: category.trim(),
          policeUnit: policeUnit || 'Special Investigation Branch',
          forensicUnit: forensicUnit || 'State Forensic Science Laboratory',
          priority: priority || 'HIGH',
          assignedOfficerId: user.id,
          createdById: user.id,
        },
      });

      await logAuditEvent({
        userId: user.id,
        userBadge: user.badgeId,
        userName: user.name,
        role: user.role,
        action: 'CASE_CREATED',
        caseId: newCase.id,
        resourceType: 'CASE_RECORD',
        resourceId: newCase.id,
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: { firNumber: newCase.firNumber, priority: newCase.priority },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        case: newCase,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to register forensic case.' });
    }
  }
);
