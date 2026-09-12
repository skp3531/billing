import { AuditLog } from '../models/AuditLog';

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

export const createAuditLog = async (params: LogParams) => {
  try {
    await AuditLog.create(params);
  } catch (error) {
    console.error('Failed to create audit log', error);
  }
};
