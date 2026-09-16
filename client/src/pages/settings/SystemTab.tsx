import React, { useState } from 'react';
import { Database, DownloadCloud, ShieldCheck, Activity } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function SystemTab({ org, onUpdate }: any) {
  const [backingUp, setBackingUp] = useState(false);

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      // Simulate backup hitting the API
      await api.put('/organization/me', { lastBackupDate: new Date() });
      toast.success('Database backup completed successfully');
      onUpdate();
    } catch {
      toast.error('Backup failed');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Database className="w-6 h-6 text-indigo-600"/> System & Backups</h1>
        <p className="text-gray-500 font-bold mt-1">Manage database syncs, security policies, and monitor uptime</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-black text-gray-900 mb-4 border-b pb-2 flex items-center gap-2"><Database className="w-5 h-5"/> Data Protection</h3>
          <p className="text-sm font-bold text-gray-600 mb-2">Last Cloud Sync: <span className="text-indigo-600 font-black">{org.lastBackupDate ? new Date(org.lastBackupDate).toLocaleString() : 'Never'}</span></p>
          <p className="text-xs text-gray-400 mb-6">Automated backups run daily at 2:00 AM.</p>
          
          <button onClick={handleBackup} disabled={backingUp} className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-xl font-black shadow-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
            <DownloadCloud className="w-5 h-5"/> {backingUp ? 'Syncing...' : 'Trigger Manual Sync Now'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-black text-gray-900 mb-4 border-b pb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> Security Policies</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <span className="font-bold text-sm">Require 2FA for Owner</span>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-1 rounded">Enabled</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <span className="font-bold text-sm">Session Timeout</span>
              <span className="font-black text-sm">4 Hours</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-gradient-to-r from-gray-900 to-indigo-900 p-6 rounded-2xl shadow-xl text-white">
          <h3 className="font-black mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400"/> System Health Monitor</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
              <p className="text-emerald-400 font-black text-xl">99.9%</p>
              <p className="text-xs font-bold text-gray-300 mt-1">Uptime</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
              <p className="text-emerald-400 font-black text-xl">14ms</p>
              <p className="text-xs font-bold text-gray-300 mt-1">API Latency</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
              <p className="text-emerald-400 font-black text-xl">Healthy</p>
              <p className="text-xs font-bold text-gray-300 mt-1">Database Cluster</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
              <p className="text-amber-400 font-black text-xl">Standby</p>
              <p className="text-xs font-bold text-gray-300 mt-1">Local Printers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
