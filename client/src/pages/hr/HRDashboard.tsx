import React, { useState, useEffect } from 'react';
import { Users, Clock, CalendarDays, Wallet, UserCheck, UserMinus, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ATTENDANCE' | 'LEAVES'>('DASHBOARD');
  const [metrics, setMetrics] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'DASHBOARD') {
        const res = await api.get('/hr/dashboard');
        setMetrics(res.data.data);
      } else if (activeTab === 'ATTENDANCE') {
        const res = await api.get('/hr/attendance');
        setAttendance(res.data.data);
      } else if (activeTab === 'LEAVES') {
        const res = await api.get('/hr/leaves');
        setLeaves(res.data.data);
      }
    } catch {
      toast.error('Failed to load HR data');
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/hr/leaves/${id}/status`, { status });
      toast.success('Leave updated');
      fetchData();
    } catch {
      toast.error('Failed to update leave');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 flex-col">
      <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Users className="w-6 h-6 text-indigo-600" /> HR & Workforce Management</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm">Manage staff, attendance, leaves, and payroll</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button onClick={() => setActiveTab('DASHBOARD')} className={clsx("px-4 py-2 text-sm font-bold rounded-lg transition-colors", activeTab === 'DASHBOARD' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Dashboard</button>
          <button onClick={() => setActiveTab('ATTENDANCE')} className={clsx("px-4 py-2 text-sm font-bold rounded-lg transition-colors", activeTab === 'ATTENDANCE' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Attendance</button>
          <button onClick={() => setActiveTab('LEAVES')} className={clsx("px-4 py-2 text-sm font-bold rounded-lg transition-colors", activeTab === 'LEAVES' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Leaves</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'DASHBOARD' && metrics && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="w-5 h-5"/></div>
                  <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Total Staff</h3>
                </div>
                <p className="text-4xl font-black text-gray-900">{metrics.totalEmployees}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck className="w-5 h-5"/></div>
                  <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Present Today</h3>
                </div>
                <p className="text-4xl font-black text-gray-900">{metrics.presentToday}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><UserMinus className="w-5 h-5"/></div>
                  <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Absent / Leave</h3>
                </div>
                <p className="text-4xl font-black text-gray-900">{metrics.absentToday + metrics.employeesOnLeave}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Wallet className="w-5 h-5"/></div>
                  <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Est. Monthly Payroll</h3>
                </div>
                <p className="text-4xl font-black text-gray-900">₹{(metrics.monthlyPayrollEstimate/1000).toFixed(1)}k</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ATTENDANCE' && (
          <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((att) => (
                  <tr key={att._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-black text-gray-900">{att.userId?.name}</div>
                      <div className="text-sm font-bold text-gray-500">{att.userId?.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {new Date(att.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                      {att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-rose-600">
                      {att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-black uppercase",
                        att.status === 'PRESENT' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-bold">No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'LEAVES' && (
          <div className="max-w-7xl mx-auto space-y-4">
            {leaves.map((leave) => (
              <div key={leave._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-gray-900">{leave.userId?.name}</h3>
                  <p className="text-sm font-bold text-gray-500 mt-1">{leave.leaveType} • {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()} ({leave.totalDays} days)</p>
                  <p className="text-sm text-gray-700 font-medium italic mt-2">"{leave.reason}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-xs font-black uppercase",
                    leave.status === 'APPROVED' ? "bg-emerald-100 text-emerald-700" : leave.status === 'REJECTED' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {leave.status}
                  </span>
                  {leave.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateLeaveStatus(leave._id, 'APPROVED')} className="bg-emerald-50 text-emerald-700 font-bold px-4 py-2 rounded-xl text-sm">Approve</button>
                      <button onClick={() => updateLeaveStatus(leave._id, 'REJECTED')} className="bg-rose-50 text-rose-700 font-bold px-4 py-2 rounded-xl text-sm">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {leaves.length === 0 && <div className="text-center py-10 font-bold text-gray-400">No leave requests found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
