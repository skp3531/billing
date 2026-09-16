import { Request, Response } from 'express';
import { Attendance } from '../models/Attendance';
import { Shift } from '../models/Shift';
import { LeaveRequest } from '../models/LeaveRequest';
import { Payslip } from '../models/Payslip';
import { successResponse, errorResponse } from '../utils/apiResponse';

export const getAttendance = async (req: Request, res: Response) => {
  const { date } = req.query;
  const match: any = { organizationId: req.user!.organizationId };
  
  if (date) {
    const start = new Date(date as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date as string);
    end.setHours(23, 59, 59, 999);
    match.date = { $gte: start, $lte: end };
  }
  
  const records = await Attendance.find(match).populate('userId', 'name department designation photoUrl');
  return successResponse(res, records);
};

export const clockIn = async (req: Request, res: Response) => {
  const { userId, outletId } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let att = await Attendance.findOne({
    userId, date: { $gte: today }
  });

  if (att && att.checkIn) {
    return errorResponse(res, 'User already clocked in today', 400);
  }

  if (!att) {
    att = new Attendance({
      organizationId: req.user!.organizationId,
      outletId: outletId || req.user!.currentOutletId,
      userId,
      date: new Date(),
      checkIn: new Date(),
      status: 'PRESENT'
    });
  } else {
    att.checkIn = new Date();
    att.status = 'PRESENT';
  }
  
  await att.save();
  return successResponse(res, att, 'Clocked in successfully');
};

export const clockOut = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const att = await Attendance.findOne({
    userId, date: { $gte: today }
  });

  if (!att || !att.checkIn) {
    return errorResponse(res, 'User has not clocked in today', 400);
  }

  if (att.checkOut) {
    return errorResponse(res, 'User already clocked out today', 400);
  }

  att.checkOut = new Date();
  
  // Calculate total working minutes
  const diffMs = att.checkOut.getTime() - att.checkIn.getTime();
  att.totalWorkingMinutes = Math.floor(diffMs / 60000);
  
  await att.save();
  return successResponse(res, att, 'Clocked out successfully');
};

// Leaves
export const getLeaves = async (req: Request, res: Response) => {
  const leaves = await LeaveRequest.find({ organizationId: req.user!.organizationId })
    .populate('userId', 'name department')
    .sort({ createdAt: -1 });
  return successResponse(res, leaves);
};

export const applyLeave = async (req: Request, res: Response) => {
  const leave = new LeaveRequest({
    ...req.body,
    userId: req.user!.id,
    organizationId: req.user!.organizationId,
  });
  await leave.save();
  return successResponse(res, leave, 'Leave applied successfully');
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  const leave = await LeaveRequest.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user!.organizationId },
    { $set: { status: req.body.status, approvedBy: req.user!.id } },
    { new: true }
  );
  if (!leave) return errorResponse(res, 'Leave not found', 404);
  return successResponse(res, leave, 'Leave status updated');
};

// HR Dashboard KPI
export const getHRDashboard = async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const [totalEmployees, presentToday, leaves] = await Promise.all([
    Attendance.db.model('User').countDocuments({ organizationId: req.user!.organizationId, active: true }),
    Attendance.countDocuments({ organizationId: req.user!.organizationId, date: { $gte: today }, status: 'PRESENT' }),
    LeaveRequest.countDocuments({ organizationId: req.user!.organizationId, startDate: { $lte: today }, endDate: { $gte: today }, status: 'APPROVED' })
  ]);
  
  return successResponse(res, {
    totalEmployees,
    presentToday,
    absentToday: totalEmployees - presentToday - leaves,
    employeesOnLeave: leaves,
    monthlyPayrollEstimate: totalEmployees * 15000 // Placeholder metric
  });
};
