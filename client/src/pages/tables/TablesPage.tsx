import React, { useEffect, useState } from 'react';
import { getTables, createTable, updateTable, deleteTable, Table } from '../../api/table.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function TablesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<Partial<Table> | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentTable?._id) {
        await updateTable(currentTable._id, currentTable);
        toast.success('Table updated');
      } else {
        await createTable(currentTable as Partial<Table>);
        toast.success('Table created');
      }
      setIsModalOpen(false);
      setCurrentTable(null);
      fetchTables();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving table');
    }
  };

  const handleStatusChange = async (id: string, status: Table['status']) => {
    try {
      await updateTable(id, { status });
      fetchTables();
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await deleteTable(id);
      toast.success('Table deleted');
      fetchTables();
    } catch (error: any) {
      toast.error('Failed to delete table');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-amber-900">Tables Management</h1>
        <button
          onClick={() => {
            setCurrentTable({ name: '', capacity: 4, status: 'AVAILABLE' });
            setIsModalOpen(true);
          }}
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
        >
          Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div
            key={table._id}
            className={`p-4 rounded-lg shadow border-l-4 ${
              table.status === 'AVAILABLE'
                ? 'border-green-500 bg-white'
                : table.status === 'OCCUPIED'
                ? 'border-red-500 bg-white'
                : 'border-yellow-500 bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800">{table.name}</h3>
              <div className="flex space-x-2 text-sm">
                <button onClick={() => { setCurrentTable(table); setIsModalOpen(true); }} className="text-blue-500 hover:underline">Edit</button>
                <button onClick={() => handleDelete(table._id)} className="text-red-500 hover:underline">Delete</button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">Capacity: {table.capacity}</p>
            
            <div className="flex gap-2 flex-wrap">
              {table.status === 'AVAILABLE' ? (
                <>
                  <button onClick={() => navigate(`/pos?table=${table.name}`)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded text-sm font-bold flex-1 hover:bg-green-200">Seat Customer</button>
                  <button onClick={() => handleStatusChange(table._id, 'RESERVED')} className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded text-sm font-bold flex-1 hover:bg-amber-200">Reserve</button>
                </>
              ) : (
                <button onClick={() => handleStatusChange(table._id, 'AVAILABLE')} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-bold flex-1 hover:bg-gray-200">Free Table</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{currentTable?._id ? 'Edit Table' : 'Add Table'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name / Number</label>
                <input
                  type="text"
                  required
                  value={currentTable?.name || ''}
                  onChange={(e) => setCurrentTable({ ...currentTable, name: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={currentTable?.capacity || 4}
                  onChange={(e) => setCurrentTable({ ...currentTable, capacity: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
