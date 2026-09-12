import { Router } from 'express';
import { getDashboardMetrics, getReportData, getInventoryReport, getProfitLossReport, getAdvancedReports } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardMetrics);
router.get('/reports', getReportData);
router.get('/reports/inventory', getInventoryReport);
router.get('/reports/profit-loss', getProfitLossReport);
router.get('/reports/advanced', getAdvancedReports);

export default router;
