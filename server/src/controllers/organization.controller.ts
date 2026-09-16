import { Request, Response } from 'express';
import { Organization } from '../models/Organization';
import { Outlet } from '../models/Outlet';
import { User } from '../models/User';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getOrganization = async (req: Request, res: Response) => {
  const org = await Organization.findById(req.user!.organizationId);
  if (!org) return errorResponse(res, 'Organization not found', 404);
  return successResponse(res, org);
};

export const updateOrganization = async (req: Request, res: Response) => {
  const org = await Organization.findByIdAndUpdate(
    req.user!.organizationId,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!org) return errorResponse(res, 'Organization not found', 404);
  return successResponse(res, org);
};

export const setupOrganization = async (req: Request, res: Response) => {
  const { organization: orgData, outlet: outletData } = req.body;
  if (!orgData?.name || !outletData?.name || !outletData?.code || !outletData?.invoicePrefix) {
    return errorResponse(res, 'Organization name and outlet details are required', 400);
  }

  // Update existing organization
  const org = await Organization.findByIdAndUpdate(
    req.user!.organizationId,
    { $set: orgData },
    { new: true, upsert: false, runValidators: true }
  );
  if (!org) return errorResponse(res, 'Organization not found', 404);

  // Create first outlet if not exists
  let outlet = await Outlet.findOne({ organizationId: org._id, code: outletData.code });
  if (!outlet) {
    outlet = await Outlet.create({
      ...outletData,
      organizationId: org._id,
    });
  }

  // Assign outlet to user if not already assigned
  await User.findByIdAndUpdate(req.user!.userId, {
    $addToSet: { outletIds: outlet._id },
  });

  return successResponse(res, { organization: org, outlet }, 'Setup complete', 200);
};


export const getCommandCenter = async (req: Request, res: Response) => {
  const orgId = req.user!.organizationId;
  const [org, totalOutlets, activeUsers] = await Promise.all([
    Organization.findById(orgId).lean(),
    Outlet.countDocuments({ organizationId: orgId, active: true }),
    User.countDocuments({ organizationId: orgId, active: true })
  ]);
  
  if (!org) return errorResponse(res, 'Organization not found', 404);

  let activeIntegrations = 0;
  if (org.integrations?.razorpayKey) activeIntegrations++;
  if (org.integrations?.zomatoId) activeIntegrations++;
  if (org.integrations?.swiggyId) activeIntegrations++;

  return successResponse(res, {
    org,
    kpis: {
      totalOutlets,
      activeUsers,
      activeIntegrations,
      activePrinters: 2, // Dummy for now
      activePaymentMethods: 5,
      activeTaxProfiles: 3
    }
  });
};
