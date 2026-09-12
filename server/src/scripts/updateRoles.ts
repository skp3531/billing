import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Role } from '../models/Role';
import { ROLE_PERMISSIONS } from '../utils/permissions';
import { connectDB } from '../config/db';

dotenv.config();

const updateRoles = async () => {
  await connectDB();
  const roles = await Role.find({});
  for (const role of roles) {
    if (ROLE_PERMISSIONS[role.name]) {
      role.permissions = ROLE_PERMISSIONS[role.name];
      await role.save();
      console.log(`Updated permissions for ${role.name}`);
    }
  }
  console.log('Done');
  process.exit(0);
};

updateRoles();
