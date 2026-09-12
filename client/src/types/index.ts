export type UserRole = 'FORENSIC_OFFICER' | 'POLICE_OFFICER' | 'JUDGE' | 'ADMINISTRATOR';

export interface User {
  id: string;
  badgeId: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
}

export interface CaseDocument {
  id: string;
  caseId?: string | null;
  evidenceId?: string | null;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSize: number;
  sha256Hash: string;
  uploadedById: string;
  uploadedAt: string;
}

export interface Case {
  id: string;
  firNumber: string;
  title: string;
  description: string;
  category: string;
  policeUnit: string;
  forensicUnit: string;
  status: 'OPEN' | 'UNDER_EXAMINATION' | 'REPORT_FILED' | 'COURT_SUBMITTED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedOfficerId: string;
  assignedOfficer?: {
    id: string;
    badgeId: string;
    name: string;
    designation: string;
    department?: string;
  };
  evidence?: Evidence[];
  reports?: Report[];
  documents?: CaseDocument[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    evidence: number;
    reports: number;
    documents?: number;
  };
}

export interface EvidenceTransfer {
  id: string;
  evidenceId: string;
  fromParty: string;
  toParty: string;
  transferredAt: string;
  purpose: string;
  action: string;
  status: string;
  notes?: string | null;
  responsibleOfficer?: {
    id: string;
    badgeId: string;
    name: string;
    designation: string;
  };
}

export interface Evidence {
  id: string;
  caseId: string;
  evidenceType: string;
  description: string;
  collectionDate: string;
  collectorName: string;
  initialCondition: string;
  currentCustodian: string;
  currentStatus: string;
  storageLocation: string;
  sha256Hash: string;
  createdAt: string;
  updatedAt: string;
  case?: {
    id: string;
    firNumber: string;
    title: string;
    priority: string;
  };
  transfers?: EvidenceTransfer[];
  documents?: CaseDocument[];
  _count?: {
    transfers: number;
    documents?: number;
  };
}

export interface ReportVersion {
  id: string;
  reportId: string;
  versionNumber: number;
  evidenceExamined: string;
  examinationMethod: string;
  observations: string;
  findings: string;
  conclusion: string;
  sha256Hash: string;
  authorId: string;
  author?: {
    id: string;
    badgeId: string;
    name: string;
    designation: string;
  };
  amendmentReason?: string | null;
  amendmentDetails?: string | null;
  isFinalized: boolean;
  finalizedAt?: string | null;
  signedByName?: string | null;
  signedById?: string | null;
  signedByDesignation?: string | null;
  signatureTimestamp?: string | null;
  signatureHash?: string | null;
  createdAt: string;
}

export interface Report {
  id: string;
  caseId: string;
  currentVersion: number;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'FINALIZED' | 'AMENDED';
  title: string;
  authorId: string;
  author?: {
    id: string;
    badgeId: string;
    name: string;
    designation: string;
    department?: string;
  };
  case?: {
    id: string;
    firNumber: string;
    title: string;
    priority: string;
    assignedOfficer?: {
      id: string;
      badgeId: string;
      name: string;
      designation: string;
    };
  };
  versions?: ReportVersion[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    versions: number;
  };
}

export interface AuditEvent {
  id: string;
  sequenceIndex: number;
  timestamp: string;
  userId: string;
  userBadge: string;
  userName: string;
  role: string;
  action: string;
  caseId?: string | null;
  resourceType: string;
  resourceId?: string | null;
  reason?: string | null;
  result: 'SUCCESS' | 'DENIED' | 'FAILURE' | 'WARNING';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: string | null;
  ipAddress?: string | null;
  previousAuditHash: string;
  currentAuditHash: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  userBadge?: string | null;
  ipAddress?: string | null;
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_POSITIVE';
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
}
