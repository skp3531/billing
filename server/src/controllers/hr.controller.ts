import { Request, Response } from 'express';
import { Attendance } from '../models/Attendance';
import { Shift } from '../models/Shift';
import { LeaveRequest } from '../models/LeaveRequest';
import { Payslip } from '../models/Payslip';
import Order from '../models/Order';
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
      outletId: outletId || (req.user!.outletIds && req.user!.outletIds[0]),
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
    userId: req.user!.userId,
    organizationId: req.user!.organizationId,
  });
  await leave.save();
  return successResponse(res, leave, 'Leave applied successfully');
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  const leave = await LeaveRequest.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user!.organizationId },
    { $set: { status: req.body.status, approvedBy: req.user!.userId } },
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

// Payroll
export const getPayslips = async (req: Request, res: Response) => {
  const { month, year } = req.query;
  const match: any = { organizationId: req.user!.organizationId };
  if (month) match.month = Number(month);
  if (year) match.year = Number(year);
  
  const payslips = await Payslip.find(match).populate('userId', 'name department designation');
  return successResponse(res, payslips);
};

export const generatePayroll = async (req: Request, res: Response) => {
  const { month, year } = req.body;
  
  // Find all active employees
  const employees = await Attendance.db.model('User').find({
    organizationId: req.user!.organizationId,
    active: true
  });
  
  const payslips = [];
  
  for (const emp of employees) {
    // Check if payslip already exists
    const existing = await Payslip.findOne({
      userId: emp._id, month, year
    });
    
    if (existing) continue;
    
    // Base salary details
    const struct = emp.salaryStructure || {};
    const basicPay = struct.basic || emp.baseSalary || 0;
    const hra = struct.hra || 0;
    const allowances = struct.allowances || 0;
    const pf = struct.pfDeduction || 0;
    const esi = struct.esiDeduction || 0;
    
    // Dummy calculation for overtime and unpaid leaves based on attendance
    // In a real app we would aggregate Attendance logs for the given month/year
    const overtimePay = 0;
    const unpaidLeaveDeduction = 0;
    
    const grossSalary = basicPay + hra + allowances + overtimePay;
    const netSalary = grossSalary - pf - esi - unpaidLeaveDeduction;
    
    const payslip = new Payslip({
      organizationId: req.user!.organizationId,
      userId: emp._id,
      month,
      year,
      basicPay,
      hra,
      allowances,
      overtimePay,
      pfDeduction: pf,
      esiDeduction: esi,
      unpaidLeaveDeduction,
      grossSalary,
      netSalary,
      status: 'DRAFT'
    });
    
    await payslip.save();
    payslips.push(payslip);
  }
  
  return successResponse(res, { generated: payslips.length }, `Generated ${payslips.length} payslips`);
};

export const updatePayslipStatus = async (req: Request, res: Response) => {
  const payslip = await Payslip.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.user!.organizationId },
    { $set: { status: req.body.status } },
    { new: true }
  );
  if (!payslip) return errorResponse(res, 'Payslip not found', 404);
  return successResponse(res, payslip, 'Payslip updated');
};

export const getPerformanceStats = async (req: Request, res: Response) => {
  const match = { organizationId: req.user!.organizationId, status: 'COMPLETED' };
  
  // Group by cashier
  const cashierStats = await Order.aggregate([
    { $match: match },
    { $group: { _id: '$cashierId', totalRevenue: { $sum: '$grandTotal' }, ordersHandled: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'cashier' } },
    { $unwind: '$cashier' },
    { $project: { name: '$cashier.name', totalRevenue: 1, ordersHandled: 1 } },
    { $sort: { totalRevenue: -1 } }
  ]);
  
  // Generate some AI string insights
  let insights = [];
  if (cashierStats.length > 0) {
    insights.push(`Cashier ${cashierStats[0].name} generated the highest revenue (₹${cashierStats[0].totalRevenue.toFixed(2)}).`);
  }
  
  return successResponse(res, { cashierStats, insights });
};
