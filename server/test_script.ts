import mongoose from 'mongoose';
import Order from './src/models/Order';
import Purchase from './src/models/Purchase';
import RawMaterial from './src/models/RawMaterial';
import { updatePurchaseStatus } from './src/controllers/purchase.controller';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/pos_test_2');
  console.log('Connected to DB');

  const orgId = new mongoose.Types.ObjectId();
  const supplierId = new mongoose.Types.ObjectId();

  // Create material
  const mat = await RawMaterial.create({
    organizationId: orgId,
    name: 'Tomato',
    unit: 'kg',
    currentStock: 10,
    unitCost: 5,
    minStockLevel: 1
  });

  // Test Purchase Reversion
  const purchase = await Purchase.create({
    organizationId: orgId,
    supplierId: supplierId,
    totalAmount: 20,
    status: 'Completed',
    items: [{
      rawMaterialId: mat._id,
      quantity: 2,
      unitCost: 10,
      total: 20
    }]
  });

  // Simulate updating purchase stock
  mat.currentStock = 12;
  mat.unitCost = ((10 * 5) + (2 * 10)) / 12; // 70 / 12 = 5.8333
  await mat.save();

  // Now revert
  const req: any = {
    params: { id: purchase._id },
    user: { organizationId: orgId },
    body: { status: 'Cancelled' }
  };
  const res: any = {
    status: (code: number) => ({
      json: (data: any) => console.log('Response:', code, data)
    })
  };

  await updatePurchaseStatus(req, res);

  const updatedMat = await RawMaterial.findById(mat._id);
  console.log('Updated Material Stock:', updatedMat?.currentStock);
  console.log('Updated Material Unit Cost:', updatedMat?.unitCost);

  console.log('Done');
  process.exit(0);
}

run().catch(console.error);
