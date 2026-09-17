import { Router } from 'express';
import { getCommandCenterData } from '../controllers/commandCenter.controller';
import { 
  getDashboardKPIs, 
  getSalesAnalytics, 
  getProductAnalytics, 
  getCustomerAnalytics, 
  getProfitAndLoss, 
  getGSTReport, 
  getAIInsights 
} from '../controllers/analytics.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/dashboard-kpis', getDashboardKPIs);

router.get('/command-center', getCommandCenterData);
router.get('/sales', getSalesAnalytics);
router.get('/products', getProductAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/profit-and-loss', getProfitAndLoss);
router.get('/gst-report', getGSTReport);

export default router;
