const fs = require('fs');
let content = fs.readFileSync('server/src/utils/inventory.ts', 'utf8');

const oldCheck = `    const materialIds = Array.from(deductions.keys());
    const materials = await RawMaterial.find({ _id: { $in: materialIds } }).session(session || null);
    
    for (const mat of materials) {
      const needed = deductions.get(mat._id.toString()) || 0;
      if (mat.currentStock < needed) {
        throw new Error(\`Insufficient stock for raw material: \${mat.name}. Needed \${needed}, but only \${mat.currentStock} available.\`);
      }
    }`;

const newCheck = `    const materialIds = Array.from(deductions.keys());
    const materials = await RawMaterial.find({ 
      _id: { $in: materialIds },
      organizationId: order.organizationId,
      outletId: order.outletId
    }).session(session || null);
    
    // Check if we found all materials and they belong to this outlet
    for (const id of materialIds) {
      const mat = materials.find(m => m._id.toString() === id);
      if (!mat) {
        throw new Error(\`Raw material \${id} not found or does not belong to this outlet/organization.\`);
      }
      
      const needed = deductions.get(id) || 0;
      if (mat.currentStock < needed) {
        throw new Error(\`Insufficient stock for raw material: \${mat.name}. Needed \${needed}, but only \${mat.currentStock} available.\`);
      }
    }`;

content = content.replace(oldCheck, newCheck);

// Same for restoreInventoryForOrder
const oldRestoreCheck = `  if (additions.size > 0) {
    const bulkOps = Array.from(additions.entries()).map(([rawMaterialId, totalQuantity]) => ({
      updateOne: {
        filter: { _id: rawMaterialId },
        update: { $inc: { currentStock: totalQuantity } }
      }
    }));
    await RawMaterial.bulkWrite(bulkOps, { session });
  }`;

const newRestoreCheck = `  if (additions.size > 0) {
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
  }`;

content = content.replace(oldRestoreCheck, newRestoreCheck);

fs.writeFileSync('server/src/utils/inventory.ts', content);
