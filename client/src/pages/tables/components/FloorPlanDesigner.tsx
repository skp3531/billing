import React, { useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { Table } from '../../../api/table.api';
import clsx from 'clsx';
import { Users, Clock, Receipt } from 'lucide-react';

interface FloorPlanDesignerProps {
  tables: Table[];
  isEditMode: boolean;
  onTableUpdate: (tableId: string, updates: Partial<Table>) => void;
  onTableClick: (table: Table) => void;
}

export const FloorPlanDesigner = ({ tables, isEditMode, onTableUpdate, onTableClick }: FloorPlanDesignerProps) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const GRID_SIZE = 20;

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resizing State
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ w: 0, h: 0, x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent, table: Table) => {
    if (!isEditMode) {
      onTableClick(table);
      return;
    }
    e.stopPropagation();
    setSelectedTable(table._id);
    setIsDragging(true);
    
    // Calculate offset from top-left of the table
    const tableEl = e.currentTarget.getBoundingClientRect();
    const containerEl = containerRef.current?.getBoundingClientRect();
    if (!containerEl) return;
    
    // Mouse pos relative to container
    const mouseX = e.clientX - containerEl.left;
    const mouseY = e.clientY - containerEl.top;
    
    setDragOffset({
      x: mouseX - (table.positionX || 0),
      y: mouseY - (table.positionY || 0)
    });
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !selectedTable || !containerRef.current) return;
    
    const containerEl = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerEl.left;
    const mouseY = e.clientY - containerEl.top;
    
    if (isDragging) {
      let newX = mouseX - dragOffset.x;
      let newY = mouseY - dragOffset.y;
      
      // Snap to grid
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
      
      onTableUpdate(selectedTable, { positionX: newX, positionY: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleContainerClick = () => {
    if (isEditMode) setSelectedTable(null);
  };
  
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-100 border-emerald-500 text-emerald-800';
      case 'OCCUPIED': return 'bg-rose-100 border-rose-500 text-rose-800';
      case 'RESERVED': return 'bg-amber-100 border-amber-500 text-amber-800';
      case 'BILLING_PENDING': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'CLEANING': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'DISABLED': return 'bg-gray-100 border-gray-400 text-gray-500 opacity-50';
      default: return 'bg-white border-gray-300 text-gray-800';
    }
  };
  
  const getShapeClasses = (shape: Table['shape']) => {
    switch (shape) {
      case 'circle': return 'rounded-full';
      default: return 'rounded-xl';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={clsx(
        "relative w-full h-[800px] overflow-hidden bg-[#f8fafc] border border-gray-200 shadow-inner rounded-3xl",
        isEditMode && "cursor-crosshair"
      )}
      onClick={handleContainerClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        backgroundImage: isEditMode ? 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)' : 'none',
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
      }}
    >
      {tables.map(table => {
        const isSelected = selectedTable === table._id;
        const w = table.width || (table.shape === 'circle' ? 100 : table.shape === 'rectangle' ? 140 : 100);
        const h = table.height || (table.shape === 'circle' ? 100 : 100);
        
        return (
          <div
            key={table._id}
            onPointerDown={(e) => handlePointerDown(e, table)}
            style={{
              transform: `translate(${table.positionX || 0}px, ${table.positionY || 0}px) rotate(${table.rotation || 0}deg)`,
              width: `${w}px`,
              height: `${h}px`,
              touchAction: 'none'
            }}
            className={clsx(
              "absolute flex flex-col items-center justify-center border-4 shadow-md select-none transition-shadow",
              getStatusColor(table.status),
              getShapeClasses(table.shape),
              !isEditMode && "hover:shadow-xl hover:scale-105 transition-transform cursor-pointer",
              isEditMode && "cursor-grab active:cursor-grabbing",
              isSelected && isEditMode && "ring-4 ring-indigo-500 ring-offset-2 z-50",
              !isSelected && "z-10"
            )}
          >
            <span className="font-black text-xl tracking-tight leading-none mb-1">
              {table.name}
            </span>
            
            <div className="flex gap-2 text-xs font-bold opacity-80 items-center bg-white/50 px-2 py-0.5 rounded-full">
              {table.status === 'OCCUPIED' && <Clock className="w-3 h-3" />}
              {table.status === 'AVAILABLE' && <Users className="w-3 h-3" />}
              {table.status === 'BILLING_PENDING' && <Receipt className="w-3 h-3" />}
              <span>{table.guestsSeated || 0}/{table.capacity}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
