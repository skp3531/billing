import { AuditLog } from '../models/AuditLog';
import mongoose from 'mongoose';

interface LogParams {
  organizationId: string;
  outletId?: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (params: LogParams & { metadata?: any }, session?: mongoose.ClientSession) => {
  try {
    if (session) {
      await AuditLog.create([params], { session });
    } else {
      await AuditLog.create(params);
    }
  } catch (error) {
    console.error('Failed to create audit log', error);
  }
};
