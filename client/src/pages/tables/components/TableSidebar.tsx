import React, { useState, useEffect } from 'react';
import { Table, transferTable, mergeTables } from '../../../api/table.api';
import { Plus, Grid2X2, Circle, RectangleHorizontal, Users, Clock, Receipt, RefreshCcw, Merge, SplitSquareHorizontal, UserX, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

interface TableSidebarProps {
  table?: Table | null;
  allTables?: Table[];
  onClose?: () => void;
  onStatusChange?: (id: string, status: Table['status']) => void;
  onUpdate?: () => void;
  isEditMode?: boolean;
  onAddTable?: (tableData: Partial<Table>) => void;
}

export const TableSidebar = ({ table, allTables = [], onClose, onStatusChange, onUpdate, isEditMode, onAddTable }: TableSidebarProps) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [shape, setShape] = useState<'square' | 'rectangle' | 'circle'>('square');
  const [floorPlan, setFloorPlan] = useState('Main Dining');

  // Operation States
  const [opMode, setOpMode] = useState<'none' | 'transfer' | 'merge'>('none');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAdd = () => {
    if (!name || !onAddTable) return toast.error('Table name is required');
    onAddTable({
      name,
      capacity: parseInt(capacity),
      shape,
      floorPlan,
      positionX: 50,
      positionY: 50,
      width: shape === 'circle' ? 100 : shape === 'rectangle' ? 140 : 100,
      height: 100,
      rotation: 0,
      status: 'AVAILABLE'
    });
    setName('');
  };

  const handleTransfer = async (toTableId: string) => {
    if (!table) return;
    setIsProcessing(true);
    try {
      await transferTable(table._id, toTableId);
      toast.success(`Transferred to new table`);
      setOpMode('none');
      if (onUpdate) onUpdate();
      if (onClose) onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMerge = async (secondaryTableId: string) => {
    if (!table) return;
    setIsProcessing(true);
    try {
      await mergeTables(table._id, secondaryTableId);
      toast.success(`Tables merged successfully`);
      setOpMode('none');
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Merge failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isEditMode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col shadow-sm shrink-0">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-black text-gray-900 text-lg">Add New Table</h3>
          <p className="text-xs text-gray-500 font-bold mt-1">Drag added tables to position them.</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Table Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. T1" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 font-bold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Floor Plan</label>
            <input value={floorPlan} onChange={e=>setFloorPlan(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity</label>
            <input type="number" value={capacity} onChange={e=>setCapacity(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 outline-none font-bold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Shape</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setShape('square')} className={clsx("py-3 flex justify-center rounded-xl border-2 transition-colors", shape === 'square' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-400')}><Grid2X2 className="w-5 h-5" /></button>
              <button onClick={() => setShape('circle')} className={clsx("py-3 flex justify-center rounded-xl border-2 transition-colors", shape === 'circle' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-400')}><Circle className="w-5 h-5" /></button>
              <button onClick={() => setShape('rectangle')} className={clsx("py-3 flex justify-center rounded-xl border-2 transition-colors", shape === 'rectangle' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-400')}><RectangleHorizontal className="w-5 h-5" /></button>
            </div>
          </div>
          <button onClick={handleAdd} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors mt-2">
            <Plus className="w-5 h-5" /> Add Table to Floor
          </button>
        </div>
      </div>
    );
  }

  if (table) {
    return (
      <div className="w-[400px] bg-white border-l border-gray-200 h-full flex flex-col shadow-2xl shrink-0 absolute right-0 z-50">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
          <div>
            <h2 className="text-3xl font-black text-gray-900">{table.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider", 
                table.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                table.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800' :
                table.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' :
                table.status === 'BILLING_PENDING' ? 'bg-blue-100 text-blue-800' :
                table.status === 'CLEANING' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              )}>
                {table.status.replace('_', ' ')}
              </span>
              <span className="text-gray-400 text-sm font-bold">• {table.floorPlan}</span>
            </div>
          </div>
          {onClose && (
            <button onClick={() => { setOpMode('none'); onClose(); }} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {opMode === 'transfer' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-indigo-900">Transfer Order To:</h3>
                <button onClick={() => setOpMode('none')} className="text-indigo-500 hover:text-indigo-700 text-sm font-bold border border-indigo-200 px-2 py-1 rounded-lg">Cancel</button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {allTables.filter(t => t._id !== table._id && t.status === 'AVAILABLE').map(t => (
                  <button 
                    key={t._id} 
                    disabled={isProcessing}
                    onClick={() => handleTransfer(t._id)}
                    className="w-full flex items-center justify-between bg-white border border-indigo-100 p-3 rounded-xl hover:border-indigo-400 transition-all text-left group"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{t.floorPlan} • Cap: {t.capacity}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
                {allTables.filter(t => t._id !== table._id && t.status === 'AVAILABLE').length === 0 && (
                  <p className="text-sm text-indigo-600/70 italic p-2 text-center">No available tables found.</p>
                )}
              </div>
            </div>
          )}

          {opMode === 'merge' && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-indigo-900">Merge with Table:</h3>
                <button onClick={() => setOpMode('none')} className="text-indigo-500 hover:text-indigo-700 text-sm font-bold border border-indigo-200 px-2 py-1 rounded-lg">Cancel</button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {allTables.filter(t => t._id !== table._id).map(t => (
                  <button 
                    key={t._id} 
                    disabled={isProcessing}
                    onClick={() => handleMerge(t._id)}
                    className="w-full flex items-center justify-between bg-white border border-indigo-100 p-3 rounded-xl hover:border-indigo-400 transition-all text-left group"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{t.floorPlan} • {t.status}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {opMode === 'none' && (
            <>
              {/* Table Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <Users className="w-5 h-5 text-indigo-500 mb-2" />
                  <p className="text-xs font-bold text-gray-500 uppercase">Guests</p>
                  <p className="text-xl font-black text-gray-900">{table.guestsSeated || 0} <span className="text-sm text-gray-400">/ {table.capacity}</span></p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <Clock className="w-5 h-5 text-indigo-500 mb-2" />
                  <p className="text-xs font-bold text-gray-500 uppercase">Occupied</p>
                  <p className="text-xl font-black text-gray-900">{table.occupiedSince ? 'Active' : '--'}</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 col-span-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase mb-0.5">Live Bill</p>
                    <p className="text-2xl font-black text-amber-900">₹{table.currentOrderId ? 'View in POS' : '0.00'}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-amber-500 opacity-50" />
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { if(onStatusChange) onStatusChange(table._id, 'OCCUPIED') }}
                    className="p-3 bg-gray-50 hover:bg-rose-50 hover:text-rose-700 text-gray-700 rounded-xl font-bold text-sm text-center transition-colors border border-gray-100"
                  >
                    Seat Guests
                  </button>
                  <button 
                    onClick={() => { if(onStatusChange) onStatusChange(table._id, 'CLEANING') }}
                    className="p-3 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 text-gray-700 rounded-xl font-bold text-sm text-center transition-colors border border-gray-100"
                  >
                    Mark Cleaning
                  </button>
                  <button 
                    onClick={() => { if(onStatusChange) onStatusChange(table._id, 'AVAILABLE') }}
                    className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-xl font-bold text-sm text-center transition-colors border border-gray-100 col-span-2"
                  >
                    Free Table
                  </button>
                </div>
              </div>

              {/* Advanced Ops */}
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Table Operations</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      if (!table.currentOrderId) return toast.error('Table has no active order to transfer');
                      setOpMode('transfer');
                    }}
                    className="w-full p-3 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors"
                  >
                    <RefreshCcw className="w-5 h-5 text-indigo-500" /> Transfer Table
                  </button>
                  <button 
                    onClick={() => {
                      if (!table.currentOrderId) return toast.error('Table has no active order to merge into');
                      setOpMode('merge');
                    }}
                    className="w-full p-3 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors"
                  >
                    <Merge className="w-5 h-5 text-indigo-500" /> Merge Tables
                  </button>
                  <button className="w-full p-3 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 rounded-xl font-bold text-sm flex items-center gap-3 transition-colors opacity-50 cursor-not-allowed">
                    <SplitSquareHorizontal className="w-5 h-5 text-indigo-500" /> Split Bill (Coming Soon)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* POS Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <a href={`/pos?table=${table.name}`} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
             Open in POS →
          </a>
        </div>
      </div>
    );
  }

  return null;
};
