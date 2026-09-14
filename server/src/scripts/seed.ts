import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Organization } from '../models/Organization';
import { Outlet } from '../models/Outlet';
import { Role } from '../models/Role';
import { User } from '../models/User';
import { ROLE_PERMISSIONS } from '../utils/permissions';
import env from '../config/env';

dotenv.config();

if (process.env.ALLOW_DB_SEED !== 'true') {
  console.error('ERROR: Database seeding is disabled. Set ALLOW_DB_SEED=true to run this script.');
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    let org = await Organization.findOne({ email: 'owner@shakesphere.com' });
    if (!org) {
      org = await Organization.create({
        name: 'Shake Sphere',
        email: 'owner@shakesphere.com',
        phone: '+91 9876543210',
        address: { street: '123 Main Street', city: 'Bhubaneswar', state: 'Odisha', pincode: '751001' },
        gstin: '21AAAAA0000A1Z5',
      });
      console.log('Created Organization');
    } else {
      console.log('Organization already exists');
    }

    let outlet = await Outlet.findOne({ organizationId: org._id, code: 'MAIN' });
    if (!outlet) {
      outlet = await Outlet.create({
        organizationId: org._id,
        name: 'Main Outlet',
        code: 'MAIN',
        invoicePrefix: 'SS',
      });
      console.log('Created Outlet');
    } else {
      console.log('Outlet already exists');
    }

    const rolesMap: any = {};
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      let role = await Role.findOne({ organizationId: org._id, name: roleName });
      if (!role) {
        role = await Role.create({
          organizationId: org._id,
          name: roleName,
          permissions,
          isSystem: true,
        });
        console.log(`Created Role: ${roleName}`);
      }
      rolesMap[roleName] = role._id;
    }

    const defaultPassword = process.env.SEED_PASSWORD || 'Default@123';
    
    const usersToSeed = [
      { name: 'Sanjay Kumar', email: 'owner@shakesphere.com', password: defaultPassword, roleName: 'OWNER' },
      { name: 'Rahul Sharma', email: 'manager@shakesphere.com', password: defaultPassword, roleName: 'MANAGER' },
      { name: 'Priya Das', email: 'cashier@shakesphere.com', password: defaultPassword, roleName: 'CASHIER' },
      { name: 'Ravi Kumar', email: 'kitchen@shakesphere.com', password: defaultPassword, roleName: 'KITCHEN' },
    ];

    for (const u of usersToSeed) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        const passwordHash = await bcrypt.hash(u.password, 12);
        await User.create({
          organizationId: org._id,
          outletIds: [outlet._id],
          name: u.name,
          email: u.email,
          passwordHash,
          roleId: rolesMap[u.roleName],
        });
        console.log(`Created User: ${u.email}`);
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
