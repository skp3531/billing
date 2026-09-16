import React, { useState } from 'react';
import { Table } from '../../../api/table.api';
import clsx from 'clsx';
import { Users, Clock } from 'lucide-react';

interface FloorPlanGridProps {
  tables: Table[];
  isEditMode: boolean;
  onTableUpdate: (tableId: string, updates: Partial<Table>) => void;
  onTableClick: (table: Table) => void;
}

export const FloorPlanGrid = ({ tables, isEditMode, onTableUpdate, onTableClick }: FloorPlanGridProps) => {
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const GRID_SIZE = 20;

  const handleDragStart = (e: React.DragEvent, tableId: string) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    setDraggedTable(tableId);
    e.dataTransfer.setData('text/plain', tableId);
    
    // Setting drag image to blank so it looks cleaner
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isEditMode || !draggedTable) return;
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Snap to grid
    const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

    onTableUpdate(draggedTable, { positionX: snappedX, positionY: snappedY });
    setDraggedTable(null);
  };

  const getStatusColor = (status: string) => {
    if (status === 'OCCUPIED') return 'bg-rose-500 border-rose-600 text-white shadow-rose-200';
    if (status === 'RESERVED') return 'bg-amber-500 border-amber-600 text-white shadow-amber-200';
    return 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200';
  };

  return (
    <div 
      className={clsx("relative w-full h-[600px] bg-gray-50 border rounded-2xl overflow-hidden", isEditMode ? 'bg-grid-pattern border-indigo-200' : 'border-gray-200')}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* CSS Grid Pattern background for Edit Mode */}
      {isEditMode && (
        <style dangerouslySetInnerHTML={{__html: `
          .bg-grid-pattern {
            background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
            background-size: 20px 20px;
          }
        `}} />
      )}

      {tables.map(table => (
        <div
          key={table._id}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, table._id!)}
          onClick={() => !isEditMode && onTableClick(table)}
          style={{
            left: table.positionX || 0,
            top: table.positionY || 0,
            width: table.shape === 'rectangle' ? 120 : 80,
            height: table.shape === 'circle' ? 80 : 80,
          }}
          className={clsx(
            "absolute flex flex-col items-center justify-center border-2 transition-all cursor-pointer shadow-md",
            table.shape === 'circle' ? 'rounded-full' : 'rounded-xl',
            getStatusColor(table.status),
            isEditMode ? 'hover:scale-105 active:scale-95 cursor-move' : 'active:scale-95',
            draggedTable === table._id ? 'opacity-50' : 'opacity-100'
          )}
        >
          <span className="font-black text-lg">{table.name}</span>
          
          <div className="flex items-center gap-1 text-[10px] font-bold mt-1 opacity-90">
            <Users className="w-3 h-3" /> {table.capacity}
          </div>
          
          {table.status === 'OCCUPIED' && !isEditMode && (
            <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Clock className="w-3 h-3" />
            </div>
          )}
        </div>
      ))}

      {tables.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
          {isEditMode ? 'Drag tables from the sidebar' : 'No tables on this floor plan'}
        </div>
      )}
    </div>
  );
};
