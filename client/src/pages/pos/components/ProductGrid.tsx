import React, { useMemo } from 'react';
import { MenuItem, Category } from '../../../types';
import { Search, Info } from 'lucide-react';
import clsx from 'clsx';

interface ProductGridProps {
  categories: Category[];
  menuItems: MenuItem[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddToCart: (item: MenuItem) => void;
}

export const ProductGrid = ({
  categories, menuItems, selectedCategory, onSelectCategory,
  searchQuery, onSearchChange, onAddToCart
}: ProductGridProps) => {
  
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? item.categoryId === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-gray-50 flex-1 overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            autoFocus
            placeholder="Search items, categories, or short codes... (F3)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-amber-500 rounded-xl text-lg transition-colors font-medium placeholder-gray-400"
          />
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="bg-white border-b border-gray-200 shrink-0 px-2 py-2">
        <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={clsx(
              "px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors",
              selectedCategory === null 
                ? "bg-gray-900 text-white shadow-sm" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => onSelectCategory(cat._id!)}
              className={clsx(
                "px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-colors",
                selectedCategory === cat._id 
                  ? "bg-amber-500 text-white shadow-sm" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <button
              key={item._id}
              onClick={() => onAddToCart(item)}
              className="flex flex-col text-left bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all active:scale-[0.98] overflow-hidden group h-32"
            >
              <div className="p-3 flex flex-col h-full">
                <div className="flex justify-between items-start mb-1">
                  <div className={clsx(
                    "w-3 h-3 rounded-sm border shrink-0 mt-1",
                    item.isVeg ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"
                  )}>
                    <div className={clsx(
                      "w-1.5 h-1.5 rounded-full mx-auto mt-[2px]",
                      item.isVeg ? "bg-green-600" : "bg-red-600"
                    )}></div>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">₹{item.basePrice}</span>
                </div>
                
                <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mt-auto">
                  {item.name}
                </h3>
                
                {item.variants && item.variants.length > 0 && (
                  <div className="mt-1 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                    {item.variants.length} Variants
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Info className="w-12 h-12 mb-2 opacity-50" />
            <p className="font-medium text-lg">No items found</p>
          </div>
        )}
      </div>
    </div>
  );
};
