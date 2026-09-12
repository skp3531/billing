import MenuItem from '../models/MenuItem';
import RawMaterial from '../models/RawMaterial';

export const deductInventoryForOrder = async (order: any) => {
  try {
    const deductions = new Map<string, number>();
    for (const item of order.items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) continue;
      const qty = item.quantity;
      if (menuItem.recipe && menuItem.recipe.length > 0) {
        for (const r of menuItem.recipe) {
          const current = deductions.get(r.rawMaterialId.toString()) || 0;
          deductions.set(r.rawMaterialId.toString(), current + (r.quantity * qty));
        }
      }
      if (item.variant && item.variant.name) {
        const variant = menuItem.variants.find((v: any) => v.name === item.variant.name);
        if (variant && variant.recipe && variant.recipe.length > 0) {
          for (const r of variant.recipe) {
            const current = deductions.get(r.rawMaterialId.toString()) || 0;
            deductions.set(r.rawMaterialId.toString(), current + (r.quantity * qty));
          }
        }
      }
      if (item.modifiers && item.modifiers.length > 0) {
        for (const mod of item.modifiers) {
          for (const group of menuItem.modifierGroups) {
            const option = group.options.find((o: any) => o.name === mod.name);
            if (option && option.recipe && option.recipe.length > 0) {
              for (const r of option.recipe) {
                const current = deductions.get(r.rawMaterialId.toString()) || 0;
                deductions.set(r.rawMaterialId.toString(), current + (r.quantity * qty));
              }
            }
          }
        }
      }
    }
    if (deductions.size > 0) {
      const bulkOps = Array.from(deductions.entries()).map(([rawMaterialId, totalQuantity]) => ({
        updateOne: {
          filter: { _id: rawMaterialId },
          update: { $inc: { currentStock: -totalQuantity } }
        }
      }));
      await RawMaterial.bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error('Inventory deduction failed:', err);
  }
};

export const restoreInventoryForOrder = async (order: any) => {
  try {
    const additions = new Map<string, number>();
    for (const item of order.items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) continue;
      const qty = item.quantity;
      if (menuItem.recipe && menuItem.recipe.length > 0) {
        for (const r of menuItem.recipe) {
          const current = additions.get(r.rawMaterialId.toString()) || 0;
          additions.set(r.rawMaterialId.toString(), current + (r.quantity * qty));
        }
      }
      if (item.variant && item.variant.name) {
        const variant = menuItem.variants.find((v: any) => v.name === item.variant.name);
        if (variant && variant.recipe && variant.recipe.length > 0) {
          for (const r of variant.recipe) {
            const current = additions.get(r.rawMaterialId.toString()) || 0;
            additions.set(r.rawMaterialId.toString(), current + (r.quantity * qty));
          }
        }
      }
      if (item.modifiers && item.modifiers.length > 0) {
        for (const mod of item.modifiers) {
          for (const group of menuItem.modifierGroups) {
            const option = group.options.find((o: any) => o.name === mod.name);
            if (option && option.recipe && option.recipe.length > 0) {
              for (const r of option.recipe) {
                const current = additions.get(r.rawMaterialId.toString()) || 0;
                additions.set(r.rawMaterialId.toString(), current + (r.quantity * qty));
              }
            }
          }
        }
      }
    }
    if (additions.size > 0) {
      const bulkOps = Array.from(additions.entries()).map(([rawMaterialId, totalQuantity]) => ({
        updateOne: {
          filter: { _id: rawMaterialId },
          update: { $inc: { currentStock: totalQuantity } }
        }
      }));
      await RawMaterial.bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error('Inventory restoration failed:', err);
  }
};
