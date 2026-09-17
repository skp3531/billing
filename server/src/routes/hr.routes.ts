import { Router } from 'express';
import { 
  getAttendance, clockIn, clockOut,
  getLeaves, applyLeave, updateLeaveStatus,
  getHRDashboard
, getPayslips, generatePayroll, updatePayslipStatus, getPerformanceStats } from '../controllers/hr.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

router.get('/dashboard', getHRDashboard);

router.get('/attendance', getAttendance);
router.post('/attendance/clock-in', clockIn);
router.post('/attendance/clock-out', clockOut);

router.get('/leaves', getLeaves);
router.post('/leaves', applyLeave);
router.patch('/leaves/:id/status', updateLeaveStatus);

export default router;

router.get('/payroll', getPayslips);
router.post('/payroll/generate', generatePayroll);
router.patch('/payroll/:id/status', updatePayslipStatus);

router.get('/performance', getPerformanceStats);
