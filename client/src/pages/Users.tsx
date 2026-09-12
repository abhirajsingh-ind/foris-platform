import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Users as UsersIcon, Shield, Lock, CheckCircle2, UserCheck, Key } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/auth/demo-users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-cyan-400" />
          User Identities & Role-Based Access Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Government-grade identity directory. Permissions are non-negotiably evaluated server-side.
        </p>
      </div>

      {/* Access Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Authorized Personnel Directory
          </span>
          <span className="text-xs text-cyan-400 font-mono">Password: ForisSecure2026!</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Badge ID</th>
                <th className="px-5 py-3">Officer Name</th>
                <th className="px-5 py-3">Designation</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Assigned Role</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-cyan-400">
                    {u.badgeId}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-white">
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">
                    {u.designation}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">
                    {u.department}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge type="role" value={u.role} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Rights Breakdown Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          Constitutional Privilege Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20 space-y-2">
            <span className="font-bold text-cyan-300 block">Forensic Officer (FEX)</span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>✓ Case inspection and registration</li>
              <li>✓ Evidence intake and custody transfer</li>
              <li>✓ Draft, finalize and digitally sign reports</li>
              <li>✓ Formulate formal versioned amendments (V2, V3)</li>
              <li className="text-red-400 font-semibold">&times; Cannot overwrite finalized report versions</li>
              <li className="text-red-400 font-semibold">&times; Cannot delete audit logs or chain history</li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-blue-500/20 space-y-2">
            <span className="font-bold text-blue-300 block">Senior Police Officer (SPO)</span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>✓ Jurisdiction case dossiers and FIR registry</li>
              <li>✓ Chain of custody dispatch and receival</li>
              <li>✓ View finalized forensic findings and reports</li>
              <li>✓ Verify cryptographic document integrity</li>
              <li className="text-red-400 font-semibold">&times; Cannot edit or amend forensic findings</li>
              <li className="text-red-400 font-semibold">&times; Cannot delete evidence custody history</li>
            </ul>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <span className="font-bold text-amber-300 block">Special Judge (JDG)</span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>✓ Complete unhindered court dossier access</li>
              <li>✓ View every historical version (V1, V2, V3)</li>
              <li>✓ Execute side-by-side differential version comparison</li>
              <li>✓ Cryptographic SHA-256 seal verification</li>
              <li className="text-red-400 font-bold">&times; STRICTLY READ-ONLY (All writes blocked)</li>
              <li className="text-red-400 font-bold">&times; Attempted modifications return HTTP 403</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
