import { Request, Response } from 'express';
import PrinterSetting from '../models/PrinterSetting';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getPrinterSettings = async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { outletId } = req.query;

  if (!outletId) {
    return errorResponse(res, 'Outlet ID is required', 400);
  }

  let settings = await PrinterSetting.find({ organizationId, outletId });
  
  // Initialize defaults if they don't exist
  if (settings.length === 0) {
    await PrinterSetting.create([
      { organizationId, outletId, type: 'RECEIPT', paperSize: '80mm', printCopies: 1, showLogo: false },
      { organizationId, outletId, type: 'KOT', paperSize: '80mm', printCopies: 1, showLogo: false }
    ]);
    settings = await PrinterSetting.find({ organizationId, outletId });
  }

  return successResponse(res, settings, 'Printer settings fetched successfully');
};

export const updatePrinterSetting = async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const setting = await PrinterSetting.findOneAndUpdate(
    { _id: id, organizationId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!setting) {
    return errorResponse(res, 'Printer setting not found', 404);
  }

  return successResponse(res, setting, 'Printer setting updated successfully');
};
