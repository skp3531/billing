const fs = require('fs');
let content = fs.readFileSync('client/src/pages/menu/MenuPage.tsx', 'utf8');

const categoriesUI = `
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="relative w-64">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search categories..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {categories.map((c: any) => (
                    <div key={c._id} className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center font-black">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{c.name}</h4>
                          <p className="text-xs text-gray-500 font-bold">{menuItems.filter((i:any) => i.categoryId?._id === c._id).length} Items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Active</span>
                        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
`;

const qrmenuUI = `
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Settings Panel */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><QrCode className="w-5 h-5 text-indigo-500" /> Live QR Menu Settings</h2>
                  <p className="text-gray-500 text-sm font-bold mb-6">Customize how your customers see your menu when they scan the table QR code.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Primary Color Theme</label>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-200 cursor-pointer shadow-sm"></div>
                        <div className="w-10 h-10 rounded-full bg-rose-600 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded-full bg-emerald-600 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded-full bg-amber-500 cursor-pointer"></div>
                        <div className="w-10 h-10 rounded-full bg-gray-900 cursor-pointer"></div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded border-gray-300" />
                        <div>
                          <p className="font-bold text-gray-800">Show Nutritional Info</p>
                          <p className="text-xs text-gray-500 font-bold">Display calories and protein tags</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded border-gray-300" />
                        <div>
                          <p className="font-bold text-gray-800">Show Allergen Warnings</p>
                          <p className="text-xs text-gray-500 font-bold">Highlight nuts, soy, gluten etc.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded border-gray-300" />
                        <div>
                          <p className="font-bold text-gray-800">Enable Table Ordering</p>
                          <p className="text-xs text-gray-500 font-bold">Allow guests to place orders directly from their phone</p>
                        </div>
                      </label>
                    </div>
                    
                    <button className="w-full bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                      Download HD QR Code
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mobile Preview */}
              <div className="col-span-1 flex justify-center">
                <div className="w-[320px] h-[640px] bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl relative border-8 border-gray-800">
                  <div className="w-32 h-6 bg-gray-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20"></div>
                  <div className="w-full h-full bg-gray-50 rounded-3xl overflow-hidden relative flex flex-col">
                    {/* Fake Phone Status Bar */}
                    <div className="h-6 w-full bg-indigo-600"></div>
                    
                    {/* Header */}
                    <div className="bg-indigo-600 text-white p-4 pt-2 shadow-md z-10">
                      <h3 className="font-black text-center text-lg">{currentOutlet?.name || 'Restaurant'}</h3>
                      <p className="text-center text-indigo-200 text-xs font-bold mt-1">Table 4</p>
                    </div>
                    
                    {/* Categories Scroll */}
                    <div className="flex gap-2 overflow-x-auto p-3 bg-white shadow-sm hide-scrollbar z-10">
                      <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold whitespace-nowrap shadow-md shadow-indigo-200">All Items</div>
                      <div className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold whitespace-nowrap">Beverages</div>
                      <div className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold whitespace-nowrap">Food</div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-20">
                      {menuItems.filter((i:any) => i.active && i.availability?.qrMenu !== false).slice(0,4).map((item: any) => (
                        <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="h-32 bg-gray-200 w-full relative">
                            {item.isBestseller && <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">BESTSELLER</span>}
                            <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 font-black px-2 py-1 rounded-lg text-sm shadow-sm">₹{item.basePrice}</span>
                          </div>
                          <div className="p-3">
                            <div className="flex items-start gap-1">
                              <div className={clsx("w-3 h-3 rounded-sm border flex items-center justify-center mt-1 shrink-0", item.isVeg ? "border-emerald-500" : "border-rose-500")}>
                                <div className={clsx("w-1.5 h-1.5 rounded-full", item.isVeg ? "bg-emerald-500" : "bg-rose-500")}></div>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.name}</h4>
                                <p className="text-gray-400 text-[10px] font-bold mt-0.5 line-clamp-1">{item.description || 'Delicious freshly prepared item.'}</p>
                              </div>
                            </div>
                            <button className="w-full mt-3 bg-indigo-50 text-indigo-600 font-bold text-xs py-2 rounded-lg border border-indigo-100">Add to Order</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Floating Cart */}
                    <div className="absolute bottom-4 left-4 right-4 bg-gray-900 text-white p-3 rounded-2xl flex justify-between items-center shadow-2xl">
                      <div>
                        <p className="text-xs text-gray-400 font-bold">2 Items</p>
                        <p className="font-black text-sm">₹240</p>
                      </div>
                      <button className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-black shadow-lg shadow-indigo-900/50">View Cart</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
`;

content = content.replace(
  /<div className="text-center p-12 text-gray-500 font-bold border border-dashed border-gray-300 rounded-2xl bg-gray-50">\s*Advanced Category Management Module coming in Phase 3!\s*<\/div>/g,
  categoriesUI.trim()
);

content = content.replace(
  /<div className="text-center p-12 text-gray-500 font-bold border border-dashed border-gray-300 rounded-2xl bg-gray-50">\s*QR Menu Preview Module coming in Phase 4!\s*<\/div>/g,
  qrmenuUI.trim()
);

fs.writeFileSync('client/src/pages/menu/MenuPage.tsx', content);
