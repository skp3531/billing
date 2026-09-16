import React, { useState, useEffect } from 'react';
import { MenuItem, Category } from '../../types';
import { getRawMaterials } from '../../api/inventory.api';
import { X, Plus, Trash2, Info, DollarSign, ChefHat, Layers, Settings, Check, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

interface MenuItemFormProps {
  item?: any | null;
  categories: Category[];
  onSave: (data: Partial<MenuItem>) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ item, categories, onSave, onClose, saving = false }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'recipe' | 'modifiers' | 'settings'>('basic');
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    name: item?.name || '',
    shortName: item?.shortName || '',
    sku: item?.sku || '',
    description: item?.description || '',
    categoryId: typeof item?.categoryId === 'object' ? item?.categoryId?._id : (item?.categoryId || categories[0]?._id || ''),
    basePrice: item?.basePrice || 0,
    taxRate: item?.taxRate || 5,
    isVeg: item?.isVeg ?? true,
    dietaryTags: item?.dietaryTags || [],
    allergens: item?.allergens || [],
    kitchenStation: item?.kitchenStation || '',
    prepTime: item?.prepTime || 5,
    isBestseller: item?.isBestseller || false,
    active: item?.active ?? true,
    recipe: item?.recipe || [],
    variants: item?.variants || [],
    modifierGroups: item?.modifierGroups || [],
    availability: item?.availability || { dineIn: true, takeaway: true, delivery: true, qrMenu: true }
  });

  useEffect(() => {
    getRawMaterials().then((res) => setRawMaterials(res.data.data || res.data)).catch(console.error);
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAvailabilityChange = (field: string, value: boolean) => {
    setFormData((prev: any) => ({ ...prev, availability: { ...prev.availability, [field]: value } }));
  };

  // Recipe calculation
  const totalFoodCost = formData.recipe.reduce((sum: number, r: any) => {
    const rm = rawMaterials.find(m => m._id === (typeof r.rawMaterialId === 'object' ? r.rawMaterialId._id : r.rawMaterialId));
    if (rm) return sum + (rm.unitCost * r.quantity);
    return sum;
  }, 0);
  
  const profit = formData.basePrice - totalFoodCost;
  const margin = formData.basePrice > 0 ? (profit / formData.basePrice) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'pricing', label: 'Pricing & Variants', icon: DollarSign },
    { id: 'recipe', label: 'Recipe & Cost', icon: ChefHat },
    { id: 'modifiers', label: 'Modifiers', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{item ? 'Edit Product' : 'Create New Product'}</h2>
            <p className="text-gray-500 font-bold text-sm mt-1">Advanced Menu Engineering Builder</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
        </div>

        {/* Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-100 p-4 overflow-y-auto hidden md:block">
            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left",
                      activeTab === tab.id 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                        : "text-gray-600 hover:bg-white hover:shadow-sm"
                    )}
                  >
                    <Icon className="w-5 h-5" /> {tab.label}
                  </button>
                );
              })}
            </div>
            
            {/* Live Costing Preview */}
            <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Profitability</p>
               <div className="space-y-2">
                 <div className="flex justify-between text-sm"><span className="text-gray-600">Price</span><span className="font-bold">₹{formData.basePrice}</span></div>
                 <div className="flex justify-between text-sm"><span className="text-gray-600">Food Cost</span><span className="font-bold text-rose-500">₹{totalFoodCost.toFixed(2)}</span></div>
                 <div className="border-t border-dashed pt-2 flex justify-between text-sm font-black">
                   <span>Margin</span>
                   <span className={clsx(margin > 60 ? 'text-emerald-500' : margin > 30 ? 'text-amber-500' : 'text-rose-500')}>
                     {margin.toFixed(1)}%
                   </span>
                 </div>
               </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
            
            {activeTab === 'basic' && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name <span className="text-rose-500">*</span></label>
                    <input type="text" required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" placeholder="e.g. KitKat Milkshake" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Short Name (For KOT)</label>
                    <input type="text" value={formData.shortName} onChange={(e) => handleChange('shortName', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="e.g. KK Shake" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">SKU / Item Code</label>
                    <input type="text" value={formData.sku} onChange={(e) => handleChange('sku', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="e.g. SHK-001" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                    <select value={formData.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                      {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="Appears on QR Menu..."></textarea>
                  </div>
                  
                  <div className="col-span-2">
                     <label className="block text-sm font-bold text-gray-700 mb-3">Dietary Classification</label>
                     <div className="flex gap-4">
                       <label className={clsx("flex-1 cursor-pointer p-4 rounded-xl border-2 text-center transition-all font-bold", formData.isVeg ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 text-gray-400 hover:bg-gray-50")} onClick={() => handleChange('isVeg', true)}>
                         <div className="w-4 h-4 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div></div>
                         Vegetarian
                       </label>
                       <label className={clsx("flex-1 cursor-pointer p-4 rounded-xl border-2 text-center transition-all font-bold", !formData.isVeg ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-100 text-gray-400 hover:bg-gray-50")} onClick={() => handleChange('isVeg', false)}>
                         <div className="w-4 h-4 border-2 border-rose-500 flex items-center justify-center mx-auto mb-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div></div>
                         Non-Vegetarian
                       </label>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-4">Base Pricing</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Selling Price (₹)</label>
                      <input type="number" value={formData.basePrice} onChange={(e) => handleChange('basePrice', Number(e.target.value))} className="w-full p-3 bg-white border-2 border-indigo-100 rounded-xl focus:border-indigo-500 outline-none font-black text-xl text-indigo-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tax Rate (%)</label>
                      <select value={formData.taxRate} onChange={(e) => handleChange('taxRate', Number(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value={0}>0% (Exempt)</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">Variants (Sizes)</h3>
                      <p className="text-sm text-gray-500">E.g., Small, Regular, Large</p>
                    </div>
                    <button onClick={() => handleChange('variants', [...formData.variants, { name: '', price: 0, active: true }])} className="text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-indigo-100">
                      <Plus className="w-4 h-4" /> Add Variant
                    </button>
                  </div>
                  
                  {formData.variants.length > 0 ? (
                    <div className="space-y-3">
                      {formData.variants.map((variant: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl border border-gray-200">
                          <div className="flex-1">
                            <input type="text" placeholder="Variant Name (e.g. Large)" value={variant.name} onChange={(e) => {
                              const newV = [...formData.variants];
                              newV[idx].name = e.target.value;
                              handleChange('variants', newV);
                            }} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-bold" />
                          </div>
                          <div className="w-32">
                            <input type="number" placeholder="Price" value={variant.price} onChange={(e) => {
                              const newV = [...formData.variants];
                              newV[idx].price = Number(e.target.value);
                              handleChange('variants', newV);
                            }} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-bold" />
                          </div>
                          <button onClick={() => {
                            const newV = formData.variants.filter((_:any, i:number) => i !== idx);
                            handleChange('variants', newV);
                          }} className="p-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <p className="text-gray-500 font-bold">No variants configured. Product will use Base Price.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'recipe' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Standard Recipe & Costing</h3>
                    <p className="text-sm text-gray-500">Link raw materials to automatically track inventory and calculate theoretical food cost.</p>
                  </div>
                  <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 font-bold text-sm">
                    Est. Cost: ₹{totalFoodCost.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-5">Raw Material</div>
                    <div className="col-span-3">Quantity</div>
                    <div className="col-span-3">Cost</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {formData.recipe.map((r: any, idx: number) => {
                    const materialId = typeof r.rawMaterialId === 'object' ? r.rawMaterialId._id : r.rawMaterialId;
                    const rm = rawMaterials.find(m => m._id === materialId);
                    const cost = rm ? (rm.unitCost * r.quantity).toFixed(2) : '0.00';
                    
                    return (
                      <div key={idx} className="grid grid-cols-12 p-3 items-center border-b border-gray-50 gap-4 hover:bg-gray-50">
                        <div className="col-span-5">
                          <select value={materialId} onChange={(e) => {
                            const newR = [...formData.recipe];
                            newR[idx].rawMaterialId = e.target.value;
                            handleChange('recipe', newR);
                          }} className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none font-bold">
                            <option value="">Select Ingredient</option>
                            {rawMaterials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                          <input type="number" value={r.quantity} onChange={(e) => {
                            const newR = [...formData.recipe];
                            newR[idx].quantity = Number(e.target.value);
                            handleChange('recipe', newR);
                          }} className="w-20 p-2 bg-white border border-gray-200 rounded-lg outline-none" />
                          <span className="text-sm font-bold text-gray-500">{rm?.unit || 'unit'}</span>
                        </div>
                        <div className="col-span-3 font-bold text-gray-700">₹{cost}</div>
                        <div className="col-span-1 flex justify-end">
                          <button onClick={() => {
                            const newR = formData.recipe.filter((_:any, i:number) => i !== idx);
                            handleChange('recipe', newR);
                          }} className="text-gray-400 hover:text-rose-500 p-2"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="p-4 bg-gray-50/50">
                    <button onClick={() => handleChange('recipe', [...formData.recipe, { rawMaterialId: '', quantity: 1 }])} className="text-indigo-600 bg-white border border-indigo-200 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-50 shadow-sm transition-colors">
                      <Plus className="w-4 h-4" /> Add Ingredient
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modifiers' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Modifier Groups</h3>
                    <p className="text-sm text-gray-500">E.g., Sugar Level, Extra Add-ons</p>
                  </div>
                  <button onClick={() => handleChange('modifierGroups', [...formData.modifierGroups, { name: '', isRequired: false, minSelections: 0, maxSelections: 1, active: true, options: [] }])} className="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-100">
                    <Plus className="w-4 h-4" /> Add Group
                  </button>
                </div>

                {formData.modifierGroups.length > 0 ? (
                  <div className="space-y-6">
                    {formData.modifierGroups.map((group: any, gIdx: number) => (
                      <div key={gIdx} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
                          <input type="text" placeholder="Group Name (e.g. Add-ons)" value={group.name} onChange={(e) => {
                            const newG = [...formData.modifierGroups];
                            newG[gIdx].name = e.target.value;
                            handleChange('modifierGroups', newG);
                          }} className="flex-1 min-w-[200px] p-2 bg-white border border-gray-300 rounded-lg outline-none font-bold" />
                          
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                              <input type="checkbox" checked={group.isRequired} onChange={(e) => {
                                const newG = [...formData.modifierGroups];
                                newG[gIdx].isRequired = e.target.checked;
                                handleChange('modifierGroups', newG);
                              }} className="w-4 h-4 text-indigo-600 rounded" /> Required
                            </label>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500 font-bold">Max:</span>
                              <input type="number" value={group.maxSelections} onChange={(e) => {
                                const newG = [...formData.modifierGroups];
                                newG[gIdx].maxSelections = Number(e.target.value);
                                handleChange('modifierGroups', newG);
                              }} className="w-16 p-1.5 bg-white border border-gray-300 rounded-lg outline-none" />
                            </div>
                            
                            <button onClick={() => {
                              const newG = formData.modifierGroups.filter((_:any, i:number) => i !== gIdx);
                              handleChange('modifierGroups', newG);
                            }} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-3">
                          {group.options.map((opt: any, oIdx: number) => (
                            <div key={oIdx} className="flex gap-3 items-center">
                              <input type="text" placeholder="Option Name" value={opt.name} onChange={(e) => {
                                const newG = [...formData.modifierGroups];
                                newG[gIdx].options[oIdx].name = e.target.value;
                                handleChange('modifierGroups', newG);
                              }} className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                              <span className="font-bold text-gray-400">+₹</span>
                              <input type="number" placeholder="0" value={opt.price} onChange={(e) => {
                                const newG = [...formData.modifierGroups];
                                newG[gIdx].options[oIdx].price = Number(e.target.value);
                                handleChange('modifierGroups', newG);
                              }} className="w-24 p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold" />
                              <button onClick={() => {
                                const newG = [...formData.modifierGroups];
                                newG[gIdx].options = newG[gIdx].options.filter((_:any, i:number) => i !== oIdx);
                                handleChange('modifierGroups', newG);
                              }} className="p-2 text-gray-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button onClick={() => {
                            const newG = [...formData.modifierGroups];
                            newG[gIdx].options.push({ name: '', price: 0, active: true });
                            handleChange('modifierGroups', newG);
                          }} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2">
                            <Plus className="w-4 h-4" /> Add Option
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center">
                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold mb-2">No modifiers configured.</p>
                    <p className="text-sm text-gray-400">Add groups like "Add-ons" or "Crust Type" to give customers choices.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8 max-w-2xl">
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-4">Operational Settings</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">KDS Routing Station</label>
                      <select value={formData.kitchenStation} onChange={(e) => handleChange('kitchenStation', e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                        <option value="">None (Auto-complete)</option>
                        <option value="KITCHEN">Main Kitchen</option>
                        <option value="BAR">Bar / Beverages</option>
                        <option value="DESSERT">Dessert Station</option>
                        <option value="GRILL">Grill Station</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Prep Time (Minutes)</label>
                      <input type="number" value={formData.prepTime} onChange={(e) => handleChange('prepTime', Number(e.target.value))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-900 mb-4">Multi-Channel Availability</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'dineIn', label: 'Dine-In POS' },
                      { id: 'takeaway', label: 'Takeaway POS' },
                      { id: 'delivery', label: 'Online Delivery' },
                      { id: 'qrMenu', label: 'Customer QR Menu' }
                    ].map(channel => (
                      <label key={channel.id} className={clsx("flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all", formData.availability[channel.id] ? "border-indigo-500 bg-indigo-50" : "border-gray-100 bg-white opacity-60")}>
                        <div className={clsx("w-6 h-6 rounded-md flex items-center justify-center transition-colors", formData.availability[channel.id] ? "bg-indigo-500" : "bg-gray-200")}>
                          {formData.availability[channel.id] && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="font-bold text-gray-800">{channel.label}</span>
                        <input type="checkbox" className="hidden" checked={formData.availability[channel.id]} onChange={(e) => handleAvailabilityChange(channel.id, e.target.checked)} />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-900 mb-4">Marketing Badges</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isBestseller} onChange={(e) => handleChange('isBestseller', e.target.checked)} className="w-5 h-5 text-amber-500 rounded border-gray-300" />
                      <span className="font-bold text-gray-700">⭐ Bestseller</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.active} onChange={(e) => handleChange('active', e.target.checked)} className="w-5 h-5 text-emerald-500 rounded border-gray-300" />
                      <span className="font-bold text-gray-700">🟢 Active in Catalog</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-500 font-bold flex items-center gap-1"><HelpCircle className="w-4 h-4" /> Changes autosave to draft</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {saving ? 'Saving Product...' : 'Save Product'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MenuItemForm;
