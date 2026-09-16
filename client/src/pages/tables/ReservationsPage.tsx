import React, { useState, useEffect } from 'react';
import { PlusIcon, UserGroupIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CalendarDays, BookOpen, Clock, Users, ChevronRight, Armchair } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<'RESERVATIONS' | 'WAITLIST'>('RESERVATIONS');
  
  const [reservations, setReservations] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [showResModal, setShowResModal] = useState(false);
  const [showWaitModal, setShowWaitModal] = useState(false);
  
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [date, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'RESERVATIONS') {
        const res = await api.get(`/reservations?date=${date}`);
        setReservations(res.data.data);
      } else {
        const res = await api.get(`/reservations/waitlist`);
        setWaitlist(res.data.data);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reservations', form);
      toast.success('Reservation confirmed!');
      setShowResModal(false);
      fetchData();
    } catch {
      toast.error('Failed to create reservation');
    }
  };

  const handleCreateWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reservations/waitlist', form);
      toast.success('Added to waitlist!');
      setShowWaitModal(false);
      fetchData();
    } catch {
      toast.error('Failed to add to waitlist');
    }
  };

  const updateResStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      toast.success(`Reservation marked as ${status}`);
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const updateWaitStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/reservations/waitlist/${id}/status`, { status });
      toast.success(`Waitlist marked as ${status}`);
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 flex-col">
      <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><BookOpen className="w-6 h-6 text-indigo-600" /> Host Stand Dashboard</h1>
          <p className="text-gray-500 font-bold mt-1 text-sm">Manage reservations, waitlists, and table assignments</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button onClick={() => setActiveTab('RESERVATIONS')} className={clsx("px-4 py-2 text-sm font-bold rounded-lg transition-colors", activeTab === 'RESERVATIONS' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Reservations</button>
            <button onClick={() => setActiveTab('WAITLIST')} className={clsx("px-4 py-2 text-sm font-bold rounded-lg transition-colors", activeTab === 'WAITLIST' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Live Waitlist</button>
          </div>
          {activeTab === 'RESERVATIONS' ? (
            <button onClick={() => { setForm({ partySize: 2, reservationDate: date, timeSlot: '19:00', status: 'CONFIRMED' }); setShowResModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-md">
              <PlusIcon className="w-5 h-5"/> New Booking
            </button>
          ) : (
            <button onClick={() => { setForm({ partySize: 2, quotedWaitTime: 15, status: 'WAITING' }); setShowWaitModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 shadow-md">
              <PlusIcon className="w-5 h-5"/> Add Walk-in
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        
        {activeTab === 'RESERVATIONS' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-gray-400" /> Bookings Schedule</h2>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            {loading ? <div className="text-center text-gray-400 font-bold py-10">Loading reservations...</div> : (
              <div className="space-y-4">
                {reservations.map(r => (
                  <div key={r._id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex items-center gap-6 hover:border-indigo-300 transition-colors">
                    <div className="w-20 text-center shrink-0 border-r border-gray-100 pr-6">
                      <p className="text-2xl font-black text-indigo-600">{r.timeSlot}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase mt-1">Arrival</p>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-gray-900">{r.customerName}</h3>
                      <p className="text-sm font-bold text-gray-500">{r.customerPhone}</p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-700">{r.partySize} Guests</span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 min-w-[120px]">
                        <Armchair className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-gray-700">{r.tableId ? r.tableId.name : 'Unassigned'}</span>
                      </div>

                      <div className="w-32">
                        {r.status === 'CONFIRMED' && <span className="bg-amber-100 text-amber-700 font-black text-xs px-3 py-1 rounded-full uppercase">Confirmed</span>}
                        {r.status === 'SEATED' && <span className="bg-emerald-100 text-emerald-700 font-black text-xs px-3 py-1 rounded-full uppercase">Seated</span>}
                        {r.status === 'NO_SHOW' && <span className="bg-rose-100 text-rose-700 font-black text-xs px-3 py-1 rounded-full uppercase">No Show</span>}
                      </div>

                      {r.status === 'CONFIRMED' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateResStatus(r._id, 'SEATED')} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg text-sm transition-colors">Seat Party</button>
                          <button onClick={() => updateResStatus(r._id, 'NO_SHOW')} className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg text-sm transition-colors">No Show</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {reservations.length === 0 && <div className="text-center py-20 font-bold text-gray-400">No bookings for this date.</div>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'WAITLIST' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-gray-400" /> Live Queue</h2>
            </div>
            
            {loading ? <div className="text-center text-gray-400 font-bold py-10">Loading waitlist...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {waitlist.map((w, idx) => (
                  <div key={w._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-lg text-gray-900">#{idx + 1} {w.customerName}</h3>
                        <p className="text-sm font-bold text-gray-500">{w.customerPhone}</p>
                      </div>
                      <div className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1 font-black text-gray-700 text-sm">
                        <Users className="w-4 h-4"/> {w.partySize}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 rounded-lg p-2 mb-4 border border-amber-100">
                      <Clock className="w-4 h-4" /> Quoted Wait: {w.quotedWaitTime} min
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => updateWaitStatus(w._id, 'SEATED')} className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black py-2 rounded-xl text-sm transition-colors">Seat</button>
                      <button onClick={() => updateWaitStatus(w._id, 'NOTIFIED')} className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-black py-2 rounded-xl text-sm transition-colors">Notify</button>
                      <button onClick={() => updateWaitStatus(w._id, 'LEFT')} className="px-3 bg-gray-50 text-gray-500 hover:bg-gray-100 font-bold py-2 rounded-xl text-sm transition-colors"><XMarkIcon className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
                {waitlist.length === 0 && <div className="col-span-3 text-center py-20 font-bold text-gray-400">Waitlist is currently empty.</div>}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Reservation Modal */}
      {showResModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600" /> New Booking</h2>
              <button onClick={() => setShowResModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateRes} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guest Name</label>
                <input required value={form.customerName || ''} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input required value={form.customerPhone || ''} onChange={e => setForm({...form, customerPhone: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Party Size</label>
                  <input type="number" min="1" required value={form.partySize || ''} onChange={e => setForm({...form, partySize: Number(e.target.value)})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                  <input type="time" required value={form.timeSlot || ''} onChange={e => setForm({...form, timeSlot: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black mt-2">Confirm Booking</button>
            </form>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" /> Add to Queue</h2>
              <button onClick={() => setShowWaitModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateWaitlist} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guest Name</label>
                <input required value={form.customerName || ''} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input required value={form.customerPhone || ''} onChange={e => setForm({...form, customerPhone: e.target.value})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Party Size</label>
                  <input type="number" min="1" required value={form.partySize || ''} onChange={e => setForm({...form, partySize: Number(e.target.value)})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wait Time (min)</label>
                  <input type="number" min="5" required value={form.quotedWaitTime || ''} onChange={e => setForm({...form, quotedWaitTime: Number(e.target.value)})} className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black mt-2">Add to Waitlist</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
