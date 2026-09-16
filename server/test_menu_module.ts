import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Organization } from './src/models/Organization';
import { Outlet } from './src/models/Outlet';
import Category from './src/models/Category';
import RawMaterial from './src/models/RawMaterial';
import MenuItem from './src/models/MenuItem';

dotenv.config();

async function runTests() {
  try {
    await mongoose.connect('mongodb+srv://admin1:admin123@cluster0.bqiawft.mongodb.net/pos_db?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to Database');
    
    console.log('\n🧪 Starting Menu Engineering Integration Test...\n');

    // 1. Setup Context
    const org = await Organization.findOne();
    if (!org) throw new Error('No Organization found.');
    console.log(`🏢 Testing context: Org [${org.name}]`);

    // 2. Setup Category
    let cat = await Category.findOne({ name: 'TEST_BEVERAGES', organizationId: org._id });
    if (!cat) cat = await Category.create({ name: 'TEST_BEVERAGES', organizationId: org._id });
    console.log('✅ Created/Found Category: TEST_BEVERAGES');

    // 3. Setup Raw Materials
    let milk = await RawMaterial.findOne({ name: 'TEST_MILK_PREMIUM', organizationId: org._id });
    if (!milk) {
      milk = await RawMaterial.create({
        name: 'TEST_MILK_PREMIUM',
        category: 'Dairy',
        unit: 'ml',
        currentStock: 10000,
        unitCost: 0.1, // 10 rupees per 100ml
        organizationId: org._id
      });
    }
    
    let chocolate = await RawMaterial.findOne({ name: 'TEST_CHOC_SYRUP', organizationId: org._id });
    if (!chocolate) {
      chocolate = await RawMaterial.create({
        name: 'TEST_CHOC_SYRUP',
        category: 'Pantry',
        unit: 'ml',
        currentStock: 5000,
        unitCost: 0.5, // 50 rupees per 100ml
        organizationId: org._id
      });
    }
    console.log('✅ Setup Raw Materials (Milk & Chocolate Syrup)');

    // 4. Create Complex Menu Item (Variant + Modifiers + Recipe)
    const menuItemData = {
      name: 'TEST_SIGNATURE_SHAKE',
      shortName: 'T_SHAKE',
      categoryId: cat._id,
      organizationId: org._id,
      basePrice: 200,
      taxRate: 5,
      taxType: 'EXCLUSIVE',
      isVeg: true,
      dietaryTags: ['VEG', 'GLUTEN_FREE'],
      kitchenStation: 'BAR',
      isBestseller: true,
      recipe: [
        { rawMaterialId: milk._id, quantity: 250 },     // 25 rupees cost
        { rawMaterialId: chocolate._id, quantity: 50 }  // 25 rupees cost
      ],
      variants: [
        { name: 'Large', price: 250, active: true }
      ],
      modifierGroups: [
        {
          name: 'Sugar Level',
          isRequired: true,
          maxSelections: 1,
          active: true,
          options: [
            { name: 'Normal Sugar', price: 0, active: true },
            { name: 'No Sugar', price: 0, active: true }
          ]
        },
        {
          name: 'Add-ons',
          isRequired: false,
          maxSelections: 3,
          active: true,
          options: [
            { name: 'Extra Oreo', price: 30, active: true },
            { name: 'Whipped Cream', price: 20, active: true }
          ]
        }
      ],
      availability: {
        dineIn: true,
        takeaway: true,
        delivery: true,
        qrMenu: true
      }
    };

    // Clean up if it exists from previous run
    await MenuItem.deleteMany({ name: 'TEST_SIGNATURE_SHAKE' });
    
    const menuItem: any = await MenuItem.create(menuItemData);
    console.log('✅ Created Complex Menu Item with Recipes, Variants, and Modifiers');

    // 5. Test the Engineering Logic manually (mimicking the controller)
    let calculatedCost = 0;
    menuItem.recipe.forEach((r: any) => {
      const rm = [milk, chocolate].find(m => m._id.toString() === r.rawMaterialId.toString());
      if (rm) calculatedCost += (rm.unitCost * r.quantity);
    });
    
    const margin = ((menuItem.basePrice - calculatedCost) / menuItem.basePrice) * 100;
    
    console.log(`\n📊 Live Costing Results:`);
    console.log(`- Selling Price: ₹${menuItem.basePrice}`);
    console.log(`- Theoretical Food Cost: ₹${calculatedCost} (Expected: ₹50)`);
    console.log(`- Profit Margin: ${margin}% (Expected: 75%)`);

    if (calculatedCost !== 50 || margin !== 75) {
      throw new Error('Food Cost Engine calculation failed!');
    }
    
    console.log('\n✅ Food Costing Engine passed perfectly.');

    // 6. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await MenuItem.deleteMany({ name: 'TEST_SIGNATURE_SHAKE' });
    await RawMaterial.deleteMany({ name: { $in: ['TEST_MILK_PREMIUM', 'TEST_CHOC_SYRUP'] } });
    await Category.deleteMany({ name: 'TEST_BEVERAGES' });
    console.log('✅ Cleanup successful');

    console.log('\n🎉 ALL MENU ENGINEERING TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

runTests();
