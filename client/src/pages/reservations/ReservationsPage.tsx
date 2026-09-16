import React, { useState, useEffect } from 'react';
import { getReservations, createReservation, updateReservation, getWaitlist, createWaitlist, updateWaitlist, Reservation, Waitlist } from '../../api/reservations.api';
import { toast } from 'react-hot-toast';
import { CalendarDays, Clock, Plus, Phone, Users, CheckCircle2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { format, differenceInMinutes } from 'date-fns';

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'waitlist'>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitlist, setWaitlist] = useState<Waitlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [isWaitModalOpen, setIsWaitModalOpen] = useState(false);

  // Forms
  const [resForm, setResForm] = useState({ customerName: '', mobileNumber: '', reservationDate: '', reservationTime: '19:00', guests: 2, status: 'BOOKED', seatingPreference: '' });
  const [waitForm, setWaitForm] = useState({ customerName: '', mobileNumber: '', guests: 2, estimatedWaitTime: 15, status: 'WAITING' });

  useEffect(() => {
    fetchData();
    // Poll waitlist every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [resData, waitData] = await Promise.all([getReservations(), getWaitlist()]);
      setReservations(resData);
      setWaitlist(waitData);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReservation(resForm as Partial<Reservation>);
      toast.success('Reservation created');
      setIsResModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to create reservation');
    }
  };

  const handleWaitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWaitlist(waitForm as Partial<Waitlist>);
      toast.success('Added to waitlist');
      setIsWaitModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to add to waitlist');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 bg-white border-b border-gray-200 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Reservations & Waitlist</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-0.5">Manage Walk-ins and Bookings</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => { setWaitForm({ customerName: '', mobileNumber: '', guests: 2, estimatedWaitTime: 15, status: 'WAITING' }); setIsWaitModalOpen(true); }} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors">
              <Plus className="w-5 h-5" /> Walk-in
            </button>
            <button onClick={() => { setResForm({ customerName: '', mobileNumber: '', reservationDate: format(new Date(), 'yyyy-MM-dd'), reservationTime: '19:00', guests: 2, status: 'BOOKED', seatingPreference: '' }); setIsResModalOpen(true); }} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-black transition-colors">
              <Plus className="w-5 h-5" /> New Booking
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setActiveTab('reservations')} className={clsx("px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors", activeTab === 'reservations' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            <CalendarDays className="w-5 h-5" /> Upcoming Bookings ({reservations.filter(r => ['BOOKED','CONFIRMED'].includes(r.status)).length})
          </button>
          <button onClick={() => setActiveTab('waitlist')} className={clsx("px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors", activeTab === 'waitlist' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            <Clock className="w-5 h-5" /> Live Waitlist Queue ({waitlist.filter(w => w.status === 'WAITING').length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'reservations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reservations.map(res => (
              <div key={res._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">{res.customerName}</h3>
                    <p className="text-sm font-bold text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {res.mobileNumber}</p>
                  </div>
                  <span className={clsx("px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider", res.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                    {res.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm font-bold bg-gray-50 p-3 rounded-xl mb-4 border border-gray-100">
                  <div className="flex items-center gap-1 text-gray-700"><CalendarDays className="w-4 h-4 text-indigo-500" /> {format(new Date(res.reservationDate), 'MMM dd')}</div>
                  <div className="flex items-center gap-1 text-gray-700"><Clock className="w-4 h-4 text-indigo-500" /> {res.reservationTime}</div>
                  <div className="flex items-center gap-1 text-gray-700"><Users className="w-4 h-4 text-indigo-500" /> {res.guests} Pax</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { updateReservation(res._id, { status: 'CHECKED_IN' }).then(fetchData) }} className="py-2 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl hover:bg-emerald-100 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Check-in
                  </button>
                  <button onClick={() => { updateReservation(res._id, { status: 'CANCELLED' }).then(fetchData) }} className="py-2 bg-rose-50 text-rose-700 font-bold text-sm rounded-xl hover:bg-rose-100 flex items-center justify-center gap-1">
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'waitlist' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Queue #</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Party</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Wait Time</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map((w, idx) => {
                  const waitedMins = differenceInMinutes(new Date(), new Date(w.createdAt));
                  const isOverdue = waitedMins > w.estimatedWaitTime;
                  return (
                    <tr key={w._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4 font-black text-2xl text-gray-300">#{idx + 1}</td>
                      <td className="p-4">
                        <p className="font-black text-gray-900 text-lg">{w.customerName}</p>
                        <p className="text-sm font-bold text-gray-500">{w.guests} Guests • {w.mobileNumber}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={clsx("text-lg font-black", isOverdue ? "text-rose-600" : "text-gray-900")}>{waitedMins}m</span>
                          <span className="text-xs font-bold text-gray-400">/ {w.estimatedWaitTime}m est.</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={clsx("px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider", w.status === 'NOTIFIED' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800')}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { updateWaitlist(w._id, { status: 'NOTIFIED' }).then(fetchData) }} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">Notify</button>
                        <button onClick={() => { updateWaitlist(w._id, { status: 'SEATED' }).then(fetchData) }} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors">Seat</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isResModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleResSubmit} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-black text-gray-900">New Reservation</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
                <input required value={resForm.customerName} onChange={e=>setResForm({...resForm, customerName: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
                  <input required value={resForm.mobileNumber} onChange={e=>setResForm({...resForm, mobileNumber: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guests</label>
                  <input required type="number" value={resForm.guests} onChange={e=>setResForm({...resForm, guests: Number(e.target.value)})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                  <input required type="date" value={resForm.reservationDate} onChange={e=>setResForm({...resForm, reservationDate: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                  <input required type="time" value={resForm.reservationTime} onChange={e=>setResForm({...resForm, reservationTime: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50">
              <button type="button" onClick={() => setIsResModalOpen(false)} className="flex-1 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition-colors">Confirm Booking</button>
            </div>
          </form>
        </div>
      )}

      {/* Waitlist Modal */}
      {isWaitModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleWaitSubmit} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-black text-gray-900">Add to Waitlist</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
                <input required value={waitForm.customerName} onChange={e=>setWaitForm({...waitForm, customerName: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile</label>
                <input required value={waitForm.mobileNumber} onChange={e=>setWaitForm({...waitForm, mobileNumber: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Guests</label>
                  <input required type="number" value={waitForm.guests} onChange={e=>setWaitForm({...waitForm, guests: Number(e.target.value)})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Est. Wait (Mins)</label>
                  <input required type="number" value={waitForm.estimatedWaitTime} onChange={e=>setWaitForm({...waitForm, estimatedWaitTime: Number(e.target.value)})} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2 bg-gray-50">
              <button type="button" onClick={() => setIsWaitModalOpen(false)} className="flex-1 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">Add to Queue</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
