import React, { useState, useEffect } from 'react';
import { MenuItem, Category, MenuVariant, ModifierGroup, ModifierOption } from '../../types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getRawMaterials } from '../../api/inventory.api';

interface MenuItemFormProps {
  item?: MenuItem | null;
  categories: Category[];
  onSave: (data: Partial<MenuItem>) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, categories, onSave, onClose, saving }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'recipe' | 'variants' | 'modifiers'>('basic');
  const [recipe, setRecipe] = useState<any[]>(item?.recipe || []);
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);

  useEffect(() => {
    getRawMaterials()
      .then((res) => setRawMaterials(res.data.data || res.data))
      .catch((err) => console.error(err));
  }, []);
  
  // Basic info
  const [name, setName] = useState(item?.name || '');
  const [shortCode, setShortCode] = useState(item?.shortCode || '');
  const [description, setDescription] = useState(item?.description || '');
  const [categoryId, setCategoryId] = useState<string>(
    item ? (typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId) : (categories[0]?._id || '')
  );
  const [basePrice, setBasePrice] = useState(item?.basePrice || 0);
  const [isVeg, setIsVegetarian] = useState(item?.isVeg ?? true);
  const [spicinessLevel, setSpicinessLevel] = useState(item?.spicinessLevel || 0);
  const [active, setActive] = useState(item?.active ?? true);

  // Variants
  const [variants, setVariants] = useState<MenuVariant[]>(item?.variants || []);

  // Modifiers
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(item?.modifierGroups || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      shortCode,
      description,
      categoryId,
      basePrice,
      isVeg,
      spicinessLevel,
      active,
      variants,
      modifierGroups,
      recipe: recipe.filter(r => r.rawMaterialId && r.quantity > 0),
    });
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: 0 }]);
  };

  const updateVariant = (index: number, key: keyof MenuVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [key]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addModifierGroup = () => {
    setModifierGroups([...modifierGroups, { name: '', required: false, minSelections: 0, maxSelections: 1, options: [] }]);
  };

  const updateModifierGroup = (index: number, key: keyof ModifierGroup, value: any) => {
    const newGroups = [...modifierGroups];
    newGroups[index] = { ...newGroups[index], [key]: value };
    setModifierGroups(newGroups);
  };

  const removeModifierGroup = (index: number) => {
    setModifierGroups(modifierGroups.filter((_, i) => i !== index));
  };

  const addModifierOption = (groupIndex: number) => {
    const newGroups = [...modifierGroups];
    newGroups[groupIndex].options.push({ name: '', price: 0, isVeg: true });
    setModifierGroups(newGroups);
  };

  const updateModifierOption = (groupIndex: number, optionIndex: number, key: keyof ModifierOption, value: any) => {
    const newGroups = [...modifierGroups];
    newGroups[groupIndex].options[optionIndex] = { ...newGroups[groupIndex].options[optionIndex], [key]: value };
    setModifierGroups(newGroups);
  };

  const removeModifierOption = (groupIndex: number, optionIndex: number) => {
    const newGroups = [...modifierGroups];
    newGroups[groupIndex].options = newGroups[groupIndex].options.filter((_, i) => i !== optionIndex);
    setModifierGroups(newGroups);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="flex border-b px-6 shrink-0">
          <button 
            className={`py-3 px-4 border-b-2 font-medium text-sm ${activeTab === 'basic' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button 
            className={`py-3 px-4 border-b-2 font-medium text-sm ${activeTab === 'recipe' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('recipe')}
          >
            Recipe
          </button>
          <button 
            className={`py-3 px-4 border-b-2 font-medium text-sm ${activeTab === 'variants' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('variants')}
          >
            Variants
          </button>
          <button 
            className={`py-3 px-4 border-b-2 font-medium text-sm ${activeTab === 'modifiers' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('modifiers')}
          >
            Modifiers
          </button>
        </div>


        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Code *</label>
                  <input required value={shortCode} onChange={e => setShortCode(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price *</label>
                <input type="number" required value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={isVeg} onChange={e => setIsVegetarian(e.target.checked)} className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                  <label className="text-sm font-medium text-gray-700">Vegetarian</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>
            </div>
          )}

          
          {activeTab === 'recipe' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Base Recipe (Deducted on Sale)</h3>
                <button type="button" onClick={() => setRecipe([...recipe, { rawMaterialId: '', quantity: 1 }])} className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  <PlusIcon className="w-4 h-4" /> Add Item
                </button>
              </div>
              {recipe.map((r, i) => (
                <div key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border">
                  <div className="flex-1">
                    <select value={r.rawMaterialId} onChange={e => { const newR = [...recipe]; newR[i].rawMaterialId = e.target.value; setRecipe(newR); }} className="w-full border rounded px-3 py-1.5 text-sm bg-white">
                      <option value="">Select Material</option>
                      {rawMaterials.map(rm => (
                        <option key={rm._id} value={rm._id}>{rm.name} ({rm.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <input type="number" step="0.01" placeholder="Qty" value={r.quantity} onChange={e => { const newR = [...recipe]; newR[i].quantity = Number(e.target.value); setRecipe(newR); }} className="w-full border rounded px-3 py-1.5 text-sm" />
                  </div>
                  <button type="button" onClick={() => setRecipe(recipe.filter((_, idx) => idx !== i))} className="p-1 text-red-500 hover:text-red-700">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {recipe.length === 0 && <p className="text-sm text-gray-500 italic">No recipe added. Inventory won't be deducted for this item.</p>}
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Item Variants (e.g., Size)</h3>
                <button type="button" onClick={addVariant} className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  <PlusIcon className="w-4 h-4" /> Add Variant
                </button>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border">
                  <div className="flex-1">
                    <input placeholder="Variant name (e.g., Large)" value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm" />
                  </div>
                  <div className="flex-1">
                    <input type="number" placeholder="Price" value={v.price} onChange={e => updateVariant(i, 'price', Number(e.target.value))} className="w-full border rounded px-3 py-1.5 text-sm" />
                  </div>
                  <button type="button" onClick={() => removeVariant(i)} className="p-1 text-red-500 hover:text-red-700">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {variants.length === 0 && <p className="text-sm text-gray-500 italic">No variants added. Base price will be used.</p>}
            </div>
          )}

          {activeTab === 'modifiers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Modifier Groups (e.g., Toppings)</h3>
                <button type="button" onClick={addModifierGroup} className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  <PlusIcon className="w-4 h-4" /> Add Group
                </button>
              </div>
              {modifierGroups.map((group, gIndex) => (
                <div key={gIndex} className="bg-gray-50 p-4 rounded-lg border space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 space-y-3">
                      <input placeholder="Group Name (e.g., Extra Toppings)" value={group.name} onChange={e => updateModifierGroup(gIndex, 'name', e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm font-medium" />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1 text-sm">
                          <input type="checkbox" checked={group.required} onChange={e => updateModifierGroup(gIndex, 'required', e.target.checked)} className="rounded text-amber-500" />
                          Required
                        </label>
                        <label className="flex items-center gap-1 text-sm">
                          Min: <input type="number" min="0" value={group.minSelections} onChange={e => updateModifierGroup(gIndex, 'minSelections', Number(e.target.value))} className="w-16 border rounded px-2 py-1" />
                        </label>
                        <label className="flex items-center gap-1 text-sm">
                          Max: <input type="number" min="1" value={group.maxSelections} onChange={e => updateModifierGroup(gIndex, 'maxSelections', Number(e.target.value))} className="w-16 border rounded px-2 py-1" />
                        </label>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeModifierGroup(gIndex)} className="p-1 text-red-500 hover:text-red-700 mt-1">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-medium text-gray-500 uppercase">Options</h4>
                      <button type="button" onClick={() => addModifierOption(gIndex)} className="text-xs text-amber-600 hover:text-amber-700">
                        + Add Option
                      </button>
                    </div>
                    {group.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex gap-2 items-center">
                        <input placeholder="Option name" value={opt.name} onChange={e => updateModifierOption(gIndex, oIndex, 'name', e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm" />
                        <input type="number" placeholder="Price" value={opt.price} onChange={e => updateModifierOption(gIndex, oIndex, 'price', Number(e.target.value))} className="w-24 border rounded px-2 py-1 text-sm" />
                        <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <input type="checkbox" checked={opt.isVeg} onChange={e => updateModifierOption(gIndex, oIndex, 'isVeg', e.target.checked)} className="rounded text-green-500" />
                          Veg
                        </label>
                        <button type="button" onClick={() => removeModifierOption(gIndex, oIndex)} className="p-1 text-red-500 hover:text-red-700">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {group.options.length === 0 && <p className="text-xs text-gray-400">No options added yet.</p>}
                  </div>
                </div>
              ))}
              {modifierGroups.length === 0 && <p className="text-sm text-gray-500 italic">No modifier groups added.</p>}
            </div>
          )}
        </div>

        <div className="p-6 border-t shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemForm;
