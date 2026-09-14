import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem';
import RawMaterial from '../models/RawMaterial';

export const deductInventoryForOrder = async (order: any, session?: mongoose.ClientSession) => {
  const deductions = new Map<string, number>();
  
  for (const item of order.items) {
    const menuItem = await MenuItem.findById(item.menuItemId).session(session || null);
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
    // Check inventory levels before deducting
    const materialIds = Array.from(deductions.keys());
    const materials = await RawMaterial.find({ 
      _id: { $in: materialIds },
      organizationId: order.organizationId,
      outletId: order.outletId
    }).session(session || null);
    
    // Check if we found all materials and they belong to this outlet
    for (const id of materialIds) {
      const mat = materials.find(m => m._id.toString() === id);
      if (!mat) {
        throw new Error(`Raw material ${id} not found or does not belong to this outlet/organization.`);
      }
      
      const needed = deductions.get(id) || 0;
      if (mat.currentStock < needed) {
        throw new Error(`Insufficient stock for raw material: ${mat.name}. Needed ${needed}, but only ${mat.currentStock} available.`);
      }
    }

    const bulkOps = Array.from(deductions.entries()).map(([rawMaterialId, totalQuantity]) => ({
      updateOne: {
        filter: { _id: rawMaterialId },
        update: { $inc: { currentStock: -totalQuantity } }
      }
    }));
    await RawMaterial.bulkWrite(bulkOps, { session });
  }
};

export const restoreInventoryForOrder = async (order: any, session?: mongoose.ClientSession) => {
  const additions = new Map<string, number>();
  for (const item of order.items) {
    const menuItem = await MenuItem.findById(item.menuItemId).session(session || null);
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
    const materialIds = Array.from(additions.keys());
    const materials = await RawMaterial.find({ 
      _id: { $in: materialIds },
      organizationId: order.organizationId,
      outletId: order.outletId
    }).session(session || null);

    if (materials.length !== materialIds.length) {
      throw new Error('Some raw materials not found or do not belong to this outlet/organization during restoration.');
    }

    const bulkOps = Array.from(additions.entries()).map(([rawMaterialId, totalQuantity]) => ({
      updateOne: {
        filter: { _id: rawMaterialId },
        update: { $inc: { currentStock: totalQuantity } }
      }
    }));
    await RawMaterial.bulkWrite(bulkOps, { session });
  }
};
