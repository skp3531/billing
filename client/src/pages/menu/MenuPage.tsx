import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Category, MenuItem } from '../../types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/category.api';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../api/menu.api';
import CategoryForm from './CategoryForm';
import MenuItemForm from './MenuItemForm';

const MenuPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);

  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [savingMenuItem, setSavingMenuItem] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    if (!selectedCategoryId) return;
    setItemsLoading(true);
    try {
      const data = await getMenuItems({ categoryId: selectedCategoryId });
      setMenuItems(data);
    } catch (err) {
      toast.error('Failed to load menu items');
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategoryId]);

  // Category Handlers
  const handleSaveCategory = async (data: Partial<Category>) => {
    setSavingCategory(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, data);
        toast.success('Category updated');
      } else {
        await createCategory(data);
        toast.success('Category created');
      }
      setShowCategoryForm(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this category? All associated menu items may be affected.')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  // Menu Item Handlers
  const handleSaveMenuItem = async (data: Partial<MenuItem>) => {
    setSavingMenuItem(true);
    try {
      if (editingMenuItem) {
        await updateMenuItem(editingMenuItem._id, data);
        toast.success('Menu item updated');
      } else {
        await createMenuItem(data);
        toast.success('Menu item created');
      }
      setShowMenuItemForm(false);
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSavingMenuItem(false);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItem(id);
      toast.success('Menu item deleted');
      fetchMenuItems();
    } catch (err) {
      toast.error('Failed to delete menu item');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-4 shrink-0 border-b bg-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1">Organize your categories, items, variants, and modifiers.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-w-0">
        {/* Left Pane - Categories */}
        <div className="w-full md:w-1/4 md:min-w-[250px] bg-gray-50 border-b md:border-b-0 md:border-r flex flex-col max-h-44 md:max-h-none md:h-full shrink-0">
          <div className="p-4 flex justify-between items-center border-b bg-gray-100">
            <h2 className="font-semibold text-gray-700">Categories</h2>
            <button
              onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}
              className="p-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-md transition-colors"
              title="Add Category"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" /></div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center p-4">No categories found.</p>
            ) : (
              <ul className="space-y-1">
                {categories.map(cat => (
                  <li key={cat._id} 
                    onClick={() => setSelectedCategoryId(cat._id)}
                    className={`flex justify-between items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${selectedCategoryId === cat._id ? 'bg-amber-100 text-amber-900' : 'hover:bg-gray-200 text-gray-700'}`}
                  >
                    <span className="font-medium text-sm truncate pr-2">{cat.name}</span>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setShowCategoryForm(true); }}
                        className="p-1 text-gray-400 hover:text-amber-600 transition-colors"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteCategory(cat._id, e)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Pane - Menu Items */}
        <div className="flex-1 bg-white flex flex-col h-full">
          <div className="p-4 flex justify-between items-center border-b">
            <h2 className="font-semibold text-gray-800">
              {categories.find(c => c._id === selectedCategoryId)?.name || 'Menu Items'}
            </h2>
            <button
              onClick={() => { 
                if(!selectedCategoryId) { toast.error("Select a category first"); return; }
                setEditingMenuItem(null); 
                setShowMenuItemForm(true); 
              }}
              disabled={!selectedCategoryId}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4" />
              Add Item
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedCategoryId ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Select a category to view items
              </div>
            ) : itemsLoading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" /></div>
            ) : menuItems.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No items in this category. Add your first item!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item._id} className="border rounded-xl p-4 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.isVegetarian ? 'bg-green-500' : 'bg-red-500'}`} title={item.isVegetarian ? "Veg" : "Non-Veg"} />
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingMenuItem(item); setShowMenuItemForm(true); }} className="p-1 text-gray-400 hover:text-amber-600"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteMenuItem(item._id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <span className="font-bold text-gray-900">₹{item.basePrice.toFixed(2)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.shortCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setShowCategoryForm(false)}
          saving={savingCategory}
        />
      )}

      {showMenuItemForm && (
        <MenuItemForm
          item={editingMenuItem}
          categories={categories}
          onSave={handleSaveMenuItem}
          onClose={() => setShowMenuItemForm(false)}
          saving={savingMenuItem}
        />
      )}
    </div>
  );
};

export default MenuPage;
