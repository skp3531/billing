import React, { useEffect, useState } from 'react';
import { getTables, getTableDashboard, updateTable, createTable, Table } from '../../api/table.api';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { FloorPlanDesigner } from './components/FloorPlanDesigner';
import { TableSidebar } from './components/TableSidebar';
import { LayoutDashboard, Save, X, Plus, Users, Wallet, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function TablesPage() {
  const { currentOutlet } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [floorPlans, setFloorPlans] = useState<string[]>(['Main Dining', 'Patio']);
  const [activePlan, setActivePlan] = useState<string>('Main Dining');
  
  const [localTables, setLocalTables] = useState<Table[]>([]);
  const [selectedTableForSidebar, setSelectedTableForSidebar] = useState<Table | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentOutlet]);

  const fetchData = async () => {
    if (!currentOutlet) return;
    try {
      setLoading(true);
      const [tableData, dashData] = await Promise.all([
        getTables(),
        getTableDashboard()
      ]);
      setTables(tableData);
      setLocalTables(tableData);
      setDashboard(dashData);
      
      const uniquePlans = Array.from(new Set(tableData.map((t: Table) => t.floorPlan).filter(Boolean))) as string[];
      if (uniquePlans.length > 0) {
        setFloorPlans(Array.from(new Set([...floorPlans, ...uniquePlans])));
        if (!uniquePlans.includes(activePlan)) setActivePlan(uniquePlans[0]);
      }
    } catch (error: any) {
      toast.error('Failed to fetch table data');
    } finally {
      setLoading(false);
    }
  };

  const activeTables = localTables.filter(t => (t.floorPlan || 'Main Dining') === activePlan);

  const handleTableUpdate = (id: string, updates: Partial<Table>) => {
    setLocalTables(prev => prev.map(t => t._id === id ? { ...t, ...updates } : t));
  };

  const handleSaveLayout = async () => {
    try {
      // Find tables that were actually moved
      const updates = localTables.filter(localT => {
        const originalT = tables.find(t => t._id === localT._id);
        return originalT && (originalT.positionX !== localT.positionX || originalT.positionY !== localT.positionY);
      });

      if (updates.length > 0) {
        await Promise.all(updates.map(t => updateTable(t._id, { positionX: t.positionX, positionY: t.positionY, width: t.width, height: t.height, rotation: t.rotation })));
        toast.success('Floor plan saved successfully');
      }
      setTables(localTables);
      setIsEditMode(false);
    } catch (error) {
      toast.error('Failed to save layout');
    }
  };

  const handleCancelEdit = () => {
    setLocalTables(tables);
    setIsEditMode(false);
  };

  const handleTableClick = (table: Table) => {
    setSelectedTableForSidebar(table);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Floor Plan...</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP KPI DASHBOARD */}
        <div className="p-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Floor Management</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-0.5">Real-time Operations & Analytics</p>
            </div>
            
            <div className="flex gap-3">
              {isEditMode ? (
                <>
                  <button onClick={handleCancelEdit} className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors">
                    <X className="w-5 h-5" /> Cancel
                  </button>
                  <button onClick={handleSaveLayout} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-colors">
                    <Save className="w-5 h-5" /> Save Layout
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-black transition-colors">
                  <LayoutDashboard className="w-5 h-5" /> Edit Floor Plan
                </button>
              )}
            </div>
          </div>

          {dashboard && (
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm text-gray-900 rounded-xl"><LayoutDashboard className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Tables</p>
                  <h3 className="text-2xl font-black text-gray-900">{dashboard.totalTables} <span className="text-sm text-gray-400 font-bold ml-1">({dashboard.occupancyPercentage}% full)</span></h3>
                </div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm text-emerald-600 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase">Available</p>
                  <h3 className="text-2xl font-black text-emerald-900">{dashboard.availableTables}</h3>
                </div>
              </div>
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm text-rose-600 rounded-xl"><Users className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs font-bold text-rose-600 uppercase">Guests Today</p>
                  <h3 className="text-2xl font-black text-rose-900">{dashboard.guestsSeatedToday}</h3>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center gap-4">
                <div className="p-3 bg-white shadow-sm text-amber-600 rounded-xl"><Wallet className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase">Table Revenue</p>
                  <h3 className="text-2xl font-black text-amber-900">₹{dashboard.tableRevenueToday.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FLOOR TABS */}
        <div className="px-6 pt-4 bg-gray-50 shrink-0 flex items-center gap-2 overflow-x-auto">
          {floorPlans.map(plan => (
            <button
              key={plan}
              onClick={() => setActivePlan(plan)}
              className={clsx(
                "px-6 py-3 font-bold text-sm rounded-t-xl transition-colors whitespace-nowrap",
                activePlan === plan 
                  ? "bg-white text-indigo-600 shadow-sm border-t-2 border-indigo-600" 
                  : "bg-gray-200/50 text-gray-500 hover:bg-gray-200"
              )}
            >
              {plan}
            </button>
          ))}
          {isEditMode && (
            <button 
              onClick={() => {
                const name = window.prompt('Enter new floor plan name:');
                if (name && !floorPlans.includes(name)) {
                  setFloorPlans([...floorPlans, name]);
                  setActivePlan(name);
                }
              }}
              className="px-4 py-2 font-bold text-sm bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 ml-2"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* FLOOR PLAN DESIGNER AREA */}
        <div className="flex-1 p-6 overflow-auto bg-white">
          <FloorPlanDesigner 
            tables={activeTables}
            isEditMode={isEditMode}
            onTableUpdate={handleTableUpdate}
            onTableClick={handleTableClick}
          />
        </div>
      </div>

      {/* TABLE SIDEBAR (Info card or Edit Panel) */}
      {(selectedTableForSidebar || isEditMode) && (
        <TableSidebar 
          table={selectedTableForSidebar}
          allTables={tables}
          isEditMode={isEditMode}
          onAddTable={async (data) => {
            try {
              const res = await createTable({ ...data, outletId: currentOutlet?._id });
              toast.success('Table added');
              fetchData();
            } catch (err) {
              toast.error('Failed to add table');
            }
          }}
          onClose={() => setSelectedTableForSidebar(null)} 
          onStatusChange={async (id, status) => {
             await updateTable(id, { status });
             fetchData();
          }}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
