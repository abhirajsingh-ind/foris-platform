import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import officerAbhirajPhoto from '../assets/officer_abhiraj.jpg';
import {
  Users as UsersIcon,
  Shield,
  Lock,
  CheckCircle2,
  UserCheck,
  Key,
  Search,
  Plus,
  X,
  FileCheck2,
  Building,
  Award,
  Fingerprint,
  Cpu,
  Eye,
  Camera,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface PersonnelMember {
  id: string;
  badgeId: string;
  name: string;
  designation: string;
  department: string;
  role: 'FORENSIC_OFFICER' | 'POLICE_OFFICER' | 'JUDGE' | 'ADMINISTRATOR';
  email: string;
  photo: string;
  clearanceLevel: string;
  biometricToken: string;
  digitalCertificateThumbprint: string;
  physicalLocation: string;
  status: 'ACTIVE_ON_DUTY' | 'IN_COURT' | 'IN_AUTOPSY' | 'FIELD_DISPATCH';
  activeCasesCount: number;
  exhibitsUnderCustody: number;
  joinedDate: string;
}

const INITIAL_PERSONNEL: PersonnelMember[] = [
  {
    id: 'usr-abhiraj',
    badgeId: 'FEX-1024',
    name: 'Dr. Abhiraj Singh',
    designation: 'Chief Forensic Scientist & Ballistics Lead',
    department: 'State Cyber & Forensic Science Laboratory (SFSL Rohini)',
    role: 'FORENSIC_OFFICER',
    email: 'abhiraj.singh@sfsl.delhi.gov.in',
    photo: officerAbhirajPhoto,
    clearanceLevel: 'TOP_SECRET_FORENSIC (CLASS-A)',
    biometricToken: 'YubiKey FIPS 140-3 Level 4 (#YK-992140)',
    digitalCertificateThumbprint: 'SHA256: 7a8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    physicalLocation: 'SFSL Rohini, Sector 14, New Delhi',
    status: 'ACTIVE_ON_DUTY',
    activeCasesCount: 18,
    exhibitsUnderCustody: 6,
    joinedDate: '12 Jan 2019',
  },
  {
    id: 'usr-judge',
    badgeId: 'JDG-8810',
    name: 'Justice K. L. Venkatraman',
    designation: 'Presiding Special Sessions Judge',
    department: 'Special Sessions Court (CBI & High Court Jurisdictions)',
    role: 'JUDGE',
    email: 'justice.venkatraman@delhicourts.nic.in',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    clearanceLevel: 'JUDICIAL_IMMUNITY_CONFIDENTIAL (CLASS-J)',
    biometricToken: 'SecuGen Hamster Pro 20 Biometric Reader (#SGN-4412)',
    digitalCertificateThumbprint: 'SHA256: 1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    physicalLocation: 'Chambers 402, Rouse Avenue Court Complex, New Delhi',
    status: 'IN_COURT',
    activeCasesCount: 42,
    exhibitsUnderCustody: 0,
    joinedDate: '04 Mar 2015',
  },
  {
    id: 'usr-rajiv',
    badgeId: 'DEL-992',
    name: 'Inspector Rajiv Mehra',
    designation: 'Senior Crime Branch Team Lead',
    department: 'Special Cell & Inquest Investigation Squad',
    role: 'POLICE_OFFICER',
    email: 'rajiv.mehra@delhipolice.gov.in',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    clearanceLevel: 'POLICE_INVESTIGATION_CLASS_1',
    biometricToken: 'Morpho MSO 1300 E3 FIPS (#MSO-8819)',
    digitalCertificateThumbprint: 'SHA256: 3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    physicalLocation: 'Crime Branch HQ, Lodhi Colony, New Delhi',
    status: 'FIELD_DISPATCH',
    activeCasesCount: 12,
    exhibitsUnderCustody: 1,
    joinedDate: '22 Aug 2017',
  },
  {
    id: 'usr-deshmukh',
    badgeId: 'MED-409',
    name: 'Dr. Neha Deshmukh',
    designation: 'Senior Forensic Pathologist & Toxicologist',
    department: 'Forensic Medicine & Toxicology Division (AIIMS / SFSL)',
    role: 'FORENSIC_OFFICER',
    email: 'neha.deshmukh@aiims.edu.in',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    clearanceLevel: 'MEDICO_LEGAL_CLASS_A',
    biometricToken: 'SmartCard PIV FIPS 201 (#SC-9092)',
    digitalCertificateThumbprint: 'SHA256: 5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    physicalLocation: 'AIIMS Central Mortuary & Pathology Wing, New Delhi',
    status: 'IN_AUTOPSY',
    activeCasesCount: 9,
    exhibitsUnderCustody: 1,
    joinedDate: '15 Feb 2020',
  },
  {
    id: 'usr-verma',
    badgeId: 'POL-782',
    name: 'Sub-Inspector K. Verma',
    designation: 'Cyber Crime Investigation Officer',
    department: 'Cyber Crime Branch, Special Division',
    role: 'POLICE_OFFICER',
    email: 'k.verma@delhipolice.gov.in',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    clearanceLevel: 'CYBER_INTELLIGENCE_CLASS_B',
    biometricToken: 'Nitrokey FIPS HSM (#NK-3301)',
    digitalCertificateThumbprint: 'SHA256: 7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
    physicalLocation: 'Cyber Police Station, Mandir Marg, New Delhi',
    status: 'ACTIVE_ON_DUTY',
    activeCasesCount: 14,
    exhibitsUnderCustody: 0,
    joinedDate: '10 Nov 2021',
  },
  {
    id: 'usr-shinde',
    badgeId: 'VAULT-042',
    name: 'P. Shinde',
    designation: 'Central Evidence Vault Custodian & Master Armorer',
    department: 'Directorate of Forensics Central Evidence Depository',
    role: 'FORENSIC_OFFICER',
    email: 'p.shinde@evidencevault.gov.in',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    clearanceLevel: 'HIGH_SECURITY_VAULT_CONTROLLER',
    biometricToken: 'Dual Iris IrisID iCAM7S (#IRIS-0092)',
    digitalCertificateThumbprint: 'SHA256: 9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    physicalLocation: 'Central Evidence Vault, Sub-Level 2, Tihar Enclave',
    status: 'ACTIVE_ON_DUTY',
    activeCasesCount: 128,
    exhibitsUnderCustody: 294,
    joinedDate: '01 Jun 2014',
  },
  {
    id: 'usr-saxena',
    badgeId: 'CYB-204',
    name: 'A. Saxena',
    designation: 'Cyber Forensic Investigator & Digital Extraction Specialist',
    department: 'Digital Forensic Extraction Wing',
    role: 'FORENSIC_OFFICER',
    email: 'a.saxena@sfsl.delhi.gov.in',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    clearanceLevel: 'DIGITAL_EXTRACTION_CLASS_A',
    biometricToken: 'SecuGen Hamster Pro (#SGN-1102)',
    digitalCertificateThumbprint: 'SHA256: 2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    physicalLocation: 'SFSL Rohini Cyber Extraction Lab',
    status: 'ACTIVE_ON_DUTY',
    activeCasesCount: 11,
    exhibitsUnderCustody: 4,
    joinedDate: '19 Aug 2022',
  },
  {
    id: 'usr-prosecutor',
    badgeId: 'PROS-501',
    name: 'Adv. R. K. Singhania',
    designation: 'Special Public Prosecutor & Judicial Liaison',
    department: 'Directorate of Prosecution, Tis Hazari Complex',
    role: 'ADMINISTRATOR',
    email: 'rk.singhania@delhiprosecution.gov.in',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    clearanceLevel: 'LEGAL_PROSECUTION_CLASS_1',
    biometricToken: 'YubiKey Bio Series (#YK-5501)',
    digitalCertificateThumbprint: 'SHA256: 4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    physicalLocation: 'Tis Hazari Court Complex, Suite 18, Delhi',
    status: 'IN_COURT',
    activeCasesCount: 31,
    exhibitsUnderCustody: 0,
    joinedDate: '14 Jan 2016',
  },
];

export const UsersPage: React.FC = () => {
  const [personnel, setPersonnel] = useState<PersonnelMember[]>(INITIAL_PERSONNEL);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState<PersonnelMember | null>(null);

  // New Officer Enrollment Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    badgeId: '',
    designation: '',
    department: '',
    role: 'FORENSIC_OFFICER' as PersonnelMember['role'],
    email: '',
    clearanceLevel: 'TOP_SECRET_FORENSIC (CLASS-A)',
    biometricToken: 'YubiKey FIPS 140-3 Level 4',
    physicalLocation: 'SFSL Rohini, Block-B, New Delhi',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  });
  const [enrollSuccessMsg, setEnrollSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/auth/demo-users');
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            // merge backend info with rich attributes
            const updated = INITIAL_PERSONNEL.map((p) => {
              const match = data.users.find((u: any) => u.badgeId === p.badgeId);
              return match ? { ...p, ...match, photo: p.photo } : p;
            });
            setPersonnel(updated);
          }
        }
      } catch (err) {
        console.warn('Backend users API unavailable, using offline roster:', err);
      }
    }
    loadUsers();
  }, []);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.name || !newOfficer.badgeId) {
      alert('Please provide officer name and badge ID.');
      return;
    }

    const created: PersonnelMember = {
      id: `usr-${Date.now()}`,
      badgeId: newOfficer.badgeId.toUpperCase(),
      name: newOfficer.name,
      designation: newOfficer.designation || 'Forensic Examiner',
      department: newOfficer.department || 'State Cyber & Forensic Laboratory',
      role: newOfficer.role,
      email: newOfficer.email || `${newOfficer.badgeId.toLowerCase()}@sfsl.delhi.gov.in`,
      photo: newOfficer.photo,
      clearanceLevel: newOfficer.clearanceLevel,
      biometricToken: newOfficer.biometricToken,
      digitalCertificateThumbprint: `SHA256: ${Math.random().toString(36).substring(2, 15)}...`,
      physicalLocation: newOfficer.physicalLocation,
      status: 'ACTIVE_ON_DUTY',
      activeCasesCount: 1,
      exhibitsUnderCustody: 0,
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setPersonnel((prev) => [created, ...prev]);
    setIsEnrollModalOpen(false);
    setEnrollSuccessMsg(`✓ Personnel enrolled successfully: ${created.name} (${created.badgeId}) with active biometric key.`);
    setTimeout(() => setEnrollSuccessMsg(null), 5000);
  };

  const filteredPersonnel = personnel.filter((m) => {
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.badgeId.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.designation.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-2 border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              NATIONAL FORENSIC DIRECTORY
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{personnel.length} ACTIVE IDENTITIES</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-cyan-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-300">
              User Identities & Constitutional Role Matrix
            </span>
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Government-grade identity directory with biometric token binding and digital certificate thumbprints.
          </p>
        </div>

        <button
          onClick={() => setIsEnrollModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-950/40 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Officer</span>
        </button>
      </div>

      {enrollSuccessMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-3.5 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{enrollSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search officer, badge ID, department..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'ALL', label: 'All Roles' },
              { id: 'FORENSIC_OFFICER', label: 'Forensic (FEX)' },
              { id: 'POLICE_OFFICER', label: 'Police (SPO)' },
              { id: 'JUDGE', label: 'Judge (JDG)' },
              { id: 'ADMINISTRATOR', label: 'Admin' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  roleFilter === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-400 font-mono text-xs">
          Universal Master Password: <strong className="text-cyan-400 select-all">ForisSecure2026!</strong>
        </div>
      </div>

      {/* Personnel Grid Cards (Visual Focus with Photos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPersonnel.map((officer) => (
          <div
            key={officer.id}
            onClick={() => setSelectedMember(officer)}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-cyan-500/50 hover:shadow-cyan-950/30 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Photo & Badge Top Header */}
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <img
                    src={officer.photo}
                    alt={officer.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-md group-hover:scale-105 transition-transform"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      officer.status === 'ACTIVE_ON_DUTY'
                        ? 'bg-emerald-400'
                        : officer.status === 'IN_COURT'
                        ? 'bg-purple-400'
                        : officer.status === 'IN_AUTOPSY'
                        ? 'bg-cyan-400'
                        : 'bg-amber-400'
                    }`}
                    title={officer.status}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {officer.badgeId}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm mt-1 truncate group-hover:text-cyan-300 transition-colors">
                    {officer.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">{officer.designation}</p>
                </div>
              </div>

              {/* Department & Role */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Role:</span>
                  <StatusBadge type="role" value={officer.role} />
                </div>
                <div className="text-[11px] text-slate-300 truncate" title={officer.department}>
                  {officer.department}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate" title={officer.physicalLocation}>
                  📍 {officer.physicalLocation}
                </div>
              </div>
            </div>

            {/* Footer metrics */}
            <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{officer.activeCasesCount} Cases</span>
              <span>{officer.exhibitsUnderCustody} Exhibits</span>
              <span className="text-cyan-400 font-bold group-hover:underline flex items-center gap-0.5">
                <Eye className="w-3 h-3" /> Dossier
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Constitutional Privilege Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          Constitutional Privilege Matrix (Role-Based Separation of Powers)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">Forensic Officer (FEX)</span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40">
                CLASS-A
              </span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>✓ Case inspection and ballistic registration</li>
              <li>✓ Evidence intake and custody transfer initiation</li>
              <li>✓ Draft, finalize, and cryptographically sign reports</li>
              <li>✓ Formulate formal versioned amendments (V2, V3)</li>
              <li className="text-red-400 font-semibold">&times; Cannot overwrite finalized historical versions</li>
              <li className="text-red-400 font-semibold">&times; Cannot delete audit logs or chain history</li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300">Senior Police Officer (SPO)</span>
              <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/40">
                CLASS-1
              </span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>✓ Jurisdiction case dossiers and FIR registration</li>
              <li>✓ Chain of custody dispatch and secure receival</li>
              <li>✓ View finalized forensic findings and reports</li>
              <li>✓ Verify cryptographic document integrity</li>
              <li className="text-red-400 font-semibold">&times; Cannot edit or amend forensic findings</li>
              <li className="text-red-400 font-semibold">&times; Cannot delete evidence custody history</li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300">Special Judge (JDG)</span>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800/40">
                CLASS-J
              </span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>✓ Complete unhindered court dossier inspection</li>
              <li>✓ View every historical version (V1, V2, V3)</li>
              <li>✓ Execute side-by-side differential version comparison</li>
              <li>✓ Section 39 & 63 BSA cryptographic verification</li>
              <li className="text-red-400 font-bold">&times; STRICTLY READ-ONLY (All writes blocked)</li>
              <li className="text-red-400 font-bold">&times; Attempted mutations return HTTP 403 Forbidden</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Personnel Dossier Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.photo}
                  alt={selectedMember.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-cyan-500/40 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Badge: <strong className="text-cyan-400">{selectedMember.badgeId}</strong> &bull; {selectedMember.designation}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Clearance & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Security Clearance
                  </span>
                  <div className="font-bold text-cyan-300 font-mono">
                    {selectedMember.clearanceLevel}
                  </div>
                  <div className="text-[10px] text-slate-500">Ministry of Home Affairs Certified</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Assigned Role
                  </span>
                  <div>
                    <StatusBadge type="role" value={selectedMember.role} />
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono font-semibold pt-1">
                    Status: {selectedMember.status}
                  </div>
                </div>
              </div>

              {/* Hardware Biometric Token Binding */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                  Hardware Biometric & HSM Token Binding
                </span>
                <div className="font-mono text-white text-xs">{selectedMember.biometricToken}</div>
                <div className="text-[10px] text-slate-400 font-mono break-all">
                  Cert Thumbprint: <span className="text-cyan-400">{selectedMember.digitalCertificateThumbprint}</span>
                </div>
              </div>

              {/* Workload Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Active Inquests</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">
                    {selectedMember.activeCasesCount}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Physical Exhibits</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    {selectedMember.exhibitsUnderCustody}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Tenure Enrolled</span>
                  <span className="text-xs font-bold font-mono text-slate-200 mt-1 block">
                    {selectedMember.joinedDate}
                  </span>
                </div>
              </div>

              {/* Jurisdiction Location */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Jurisdiction & Physical Station
                </span>
                <p className="text-slate-200">{selectedMember.department}</p>
                <p className="text-cyan-400 font-mono text-[10px] mt-0.5">
                  📍 {selectedMember.physicalLocation}
                </p>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll New Officer Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Enroll Authorized Forensic Personnel
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Government Identity Provisioning</p>
                </div>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Chander"
                    value={newOfficer.name}
                    onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Official Badge ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FEX-2090"
                    value={newOfficer.badgeId}
                    onChange={(e) => setNewOfficer({ ...newOfficer, badgeId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-cyan-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Official Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Ballistic Examiner"
                    value={newOfficer.designation}
                    onChange={(e) => setNewOfficer({ ...newOfficer, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Assigned Role *
                  </label>
                  <select
                    value={newOfficer.role}
                    onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="FORENSIC_OFFICER">FORENSIC_OFFICER (FEX)</option>
                    <option value="POLICE_OFFICER">POLICE_OFFICER (SPO)</option>
                    <option value="JUDGE">JUDGE (JDG - Read-Only)</option>
                    <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Department / Laboratory Station
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Cyber & Forensic Science Laboratory (SFSL Rohini)"
                  value={newOfficer.department}
                  onChange={(e) => setNewOfficer({ ...newOfficer, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Official Government Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. r.chander@sfsl.delhi.gov.in"
                    value={newOfficer.email}
                    onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Hardware Biometric Key Serial
                  </label>
                  <input
                    type="text"
                    value={newOfficer.biometricToken}
                    onChange={(e) => setNewOfficer({ ...newOfficer, biometricToken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Officer Photo Portrait URL
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={newOfficer.photo}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40 shrink-0"
                  />
                  <input
                    type="text"
                    value={newOfficer.photo}
                    onChange={(e) => setNewOfficer({ ...newOfficer, photo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="px-1 py-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-cyan-950/40"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
