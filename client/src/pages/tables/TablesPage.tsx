import React, { useEffect, useState } from 'react';
import { getTables, createTable, updateTable, Table } from '../../api/table.api';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { FloorPlanGrid } from './components/FloorPlanGrid';
import { TableSidebar } from './components/TableSidebar';
import { LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

export default function TablesPage() {
  const { currentOutlet } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [floorPlans, setFloorPlans] = useState<string[]>(['Main Dining', 'Patio']);
  const [activePlan, setActivePlan] = useState<string>('Main Dining');
  
  // Local state for dragging before saving to DB
  const [localTables, setLocalTables] = useState<Table[]>([]);

  const fetchTables = async () => {
    if (!currentOutlet) return;
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data);
      setLocalTables(data);
      
      const uniquePlans = Array.from(new Set(data.map((t: Table) => t.floorPlan).filter(Boolean))) as string[];
      if (uniquePlans.length > 0) {
        // Only override if we found plans in DB and it's not in our defaults
        setFloorPlans(Array.from(new Set([...floorPlans, ...uniquePlans])));
      }
    } catch (error: any) {
      toast.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [currentOutlet]);

  const handleTableUpdateLocal = (tableId: string, updates: Partial<Table>) => {
    setLocalTables(prev => prev.map(t => t._id === tableId ? { ...t, ...updates } : t));
  };

  const handleSaveLayout = async () => {
    try {
      const promises = localTables.map(t => updateTable(t._id!, t));
      await Promise.all(promises);
      toast.success('Floor plan layout saved!');
      setIsEditMode(false);
      setTables(localTables);
    } catch (err) {
      toast.error('Failed to save layout');
    }
  };

  const handleAddTable = async (tableData: any) => {
    try {
      if (!currentOutlet) return;
      const data = { ...tableData, floorPlan: activePlan, outletId: currentOutlet._id };
      const newTable = await createTable(data);
      setTables(prev => [...prev, newTable]);
      setLocalTables(prev => [...prev, newTable]);
      toast.success(`Table ${newTable.name} added`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add table');
    }
  };

  const handleTableClick = (table: Table) => {
    if (table.status === 'AVAILABLE') {
      // In a real app, this would route to POS with table selected
      toast.success(`Starting new order for ${table.name}`);
    } else {
      toast('Managing active order (Phase 2 feature)');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Tables...</div>;

  const currentFloorTables = localTables.filter(t => (t.floorPlan || 'Main Dining') === activePlan);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
      
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Table Management</h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">Floor Plan Editor</p>
          </div>
        </div>
        
        {/* Floor Plan Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl">
          {floorPlans.map(plan => (
            <button
              key={plan}
              onClick={() => setActivePlan(plan)}
              className={clsx(
                "px-5 py-2 rounded-lg font-bold text-sm transition-all",
                activePlan === plan 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-gray-50 p-6 gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <FloorPlanGrid 
            tables={currentFloorTables} 
            isEditMode={isEditMode} 
            onTableUpdate={handleTableUpdateLocal}
            onTableClick={handleTableClick}
          />
        </div>
        
        <TableSidebar 
          isEditMode={isEditMode}
          onAddTable={handleAddTable}
          onSaveLayout={handleSaveLayout}
          onToggleMode={() => {
            setIsEditMode(!isEditMode);
            if (isEditMode) setLocalTables(tables); // revert changes if cancelled
          }}
        />
      </div>

    </div>
  );
}
