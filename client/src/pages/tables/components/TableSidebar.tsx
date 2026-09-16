import React, { useState } from 'react';
import { Plus, Grid2X2, Circle, RectangleHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

interface TableSidebarProps {
  isEditMode: boolean;
  onAddTable: (tableData: any) => void;
  onSaveLayout: () => void;
  onToggleMode: () => void;
}

export const TableSidebar = ({ isEditMode, onAddTable, onSaveLayout, onToggleMode }: TableSidebarProps) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [shape, setShape] = useState<'square' | 'rectangle' | 'circle'>('square');

  const handleAdd = () => {
    if (!name) return toast.error('Table name is required');
    onAddTable({
      name,
      capacity: parseInt(capacity),
      shape,
      positionX: 50,
      positionY: 50,
      status: 'AVAILABLE'
    });
    setName('');
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col shadow-sm shrink-0">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-2">
        <button 
          onClick={onToggleMode}
          className={clsx(
            "flex-1 py-2 rounded-xl font-bold text-sm transition-colors",
            isEditMode ? "bg-amber-100 text-amber-700" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
          )}
        >
          {isEditMode ? 'Cancel Edit' : 'Edit Layout'}
        </button>
        {isEditMode && (
          <button 
            onClick={onSaveLayout}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
          >
            Save Layout
          </button>
        )}
      </div>

      {isEditMode ? (
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm mb-4">Add New Table</h3>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Table Label</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 font-bold" 
              placeholder="e.g. T1, Balcony-1" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Capacity (Pax)</label>
            <input 
              type="number" 
              value={capacity} 
              onChange={e => setCapacity(e.target.value)} 
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 font-bold" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'square', icon: Grid2X2 },
                { id: 'rectangle', icon: RectangleHorizontal },
                { id: 'circle', icon: Circle },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id as any)}
                  className={clsx(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors",
                    shape === s.id ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-100 bg-white text-gray-400 hover:bg-gray-50"
                  )}
                >
                  <s.icon className="w-6 h-6 mb-1" />
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="w-full py-3 mt-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Table to Map
          </button>
        </div>
      ) : (
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center text-gray-500">
          <Grid2X2 className="w-12 h-12 mb-4 opacity-20 text-indigo-500" />
          <p className="font-bold text-gray-900">Live Service Mode</p>
          <p className="text-sm mt-1">Click any table on the floor plan to manage its active order or update its status.</p>
        </div>
      )}
    </div>
  );
};
