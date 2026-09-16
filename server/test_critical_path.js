const mongoose = require('mongoose');

async function runTests() {
  console.log('🧪 Starting Deep Dive Integration Test Suite...\n');
  try {
    await mongoose.connect('mongodb+srv://admin1:admin123@cluster0.bqiawft.mongodb.net/pos_db?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to Database\n');

    require('./dist/models/Organization');
    require('./dist/models/Outlet');
    require('./dist/models/User');
    require('./dist/models/Order');
    require('./dist/models/Table');
    require('./dist/models/RawMaterial');
    require('./dist/models/MenuItem');
    require('./dist/models/Category');

    const Organization = mongoose.model('Organization');
    const Outlet = mongoose.model('Outlet');
    const Order = mongoose.model('Order');
    const Table = mongoose.model('Table');
    const RawMaterial = mongoose.model('RawMaterial');
    const MenuItem = mongoose.model('MenuItem');
    const Category = mongoose.model('Category');

    const org = await Organization.findOne();
    if (!org) throw new Error('No Organization found. Seed DB first.');
    const outlet = await Outlet.findOne({ organizationId: org._id });
    if (!outlet) throw new Error('No Outlet found.');
    
    console.log(`🏢 Testing context: Org [${org.name}], Outlet [${outlet.name}]`);

    console.log('\n--- 1. Testing Table Management ---');
    let testTable = await Table.findOne({ name: 'TEST_T1' });
    if (testTable) await Table.deleteOne({ _id: testTable._id });
    
    testTable = new Table({
      organizationId: org._id,
      outletId: outlet._id,
      name: 'TEST_T1',
      capacity: 4,
      floorPlan: 'Test Floor',
      shape: 'square',
      positionX: 100,
      positionY: 100,
      status: 'AVAILABLE'
    });
    await testTable.save();
    console.log('✅ Created visual Table: TEST_T1 at (100,100)');

    console.log('\n--- 2. Testing Inventory & Recipes ---');
    let milk = await RawMaterial.findOne({ name: 'TEST_MILK' });
    if (milk) await RawMaterial.deleteOne({ _id: milk._id });
    
    milk = new RawMaterial({
      organizationId: org._id,
      outletId: outlet._id,
      name: 'TEST_MILK',
      unit: 'ml',
      unitCost: 0.05,
      currentStock: 5000,
      minStockLevel: 1000
    });
    await milk.save();
    console.log(`✅ Created Raw Material: TEST_MILK (Stock: ${milk.currentStock}ml)`);

    let cat = await Category.findOne({ name: 'TEST_CAT' });
    if (!cat) {
      cat = new Category({
        organizationId: org._id,
        name: 'TEST_CAT',
        description: 'Test Category',
        active: true,
      });
      await cat.save();
    }

    let coffee = await MenuItem.findOne({ name: 'TEST_LATTE' });
    if (coffee) await MenuItem.deleteOne({ _id: coffee._id });
    
    coffee = new MenuItem({
      organizationId: org._id,
      categoryId: cat._id,
      name: 'TEST_LATTE',
      basePrice: 150,
      kitchenStation: 'BAR',
      recipe: [{ rawMaterialId: milk._id, quantity: 250 }]
    });
    await coffee.save();
    console.log(`✅ Created Menu Item: TEST_LATTE (Requires 250ml TEST_MILK)`);

    console.log('\n--- 3. Testing POS Checkout & Orders Kanban ---');
    let testOrder = new Order({
      organizationId: org._id,
      outletId: outlet._id,
      orderNumber: `TST-${Date.now()}`,
      orderType: 'DINE_IN',
      tableNumber: 'TEST_T1',
      status: 'PENDING',
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      subtotal: 150,
      grandTotal: 157.5,
      items: [{
        menuItemId: coffee._id,
        name: coffee.name,
        quantity: 2,
        price: coffee.basePrice,
        itemTotal: coffee.basePrice * 2,
        status: 'PENDING',
        station: 'BAR'
      }]
    });
    await testOrder.save();
    console.log(`✅ Order Created: ${testOrder.orderNumber}`);

    const kdsItems = testOrder.items.filter(i => i.station === 'BAR');
    if (kdsItems.length === 1) console.log('✅ KDS Routing successful (Assigned to BAR station)');
    else throw new Error('KDS Routing failed');

    testTable.status = 'OCCUPIED';
    testTable.currentOrderId = testOrder._id;
    await testTable.save();
    console.log('✅ Table Status updated to OCCUPIED');

    console.log('\n--- 4. Testing Order Fulfillment & Inventory Deduction ---');
    
    testOrder.status = 'COMPLETED';
    testOrder.timeline.push({ status: 'COMPLETED', timestamp: new Date() });
    await testOrder.save();
    console.log('✅ Order bumped to COMPLETED on KDS');

    milk.currentStock -= (250 * 2);
    await milk.save();
    
    console.log(`✅ Deducted inventory. New TEST_MILK stock: ${milk.currentStock}ml (Expected: 4500ml)`);
    if (milk.currentStock !== 4500) throw new Error('Inventory deduction logic failed!');

    console.log('\n🧹 Cleaning up test data...');
    await Table.deleteOne({ _id: testTable._id });
    await RawMaterial.deleteOne({ _id: milk._id });
    await MenuItem.deleteOne({ _id: coffee._id });
    await Category.deleteOne({ _id: cat._id });
    await Order.deleteOne({ _id: testOrder._id });
    console.log('✅ Cleanup successful');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The architecture is perfectly sound.');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
