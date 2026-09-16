import { Router } from 'express';
import authRoutes from './auth.routes';
import orgRoutes from './organization.routes';
import outletRoutes from './outlet.routes';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import categoryRoutes from './category.routes';
import menuItemRoutes from './menuItem.routes';
import orderRoutes from './order.routes';
import tableRoutes from './table.routes';
import analyticsRoutes from './analytics.routes';
import supplierRoutes from './supplier.routes';
import rawMaterialRoutes from './rawMaterial.routes';
import purchaseRoutes from './purchase.routes';
import customerRoutes from './customer.routes';
import expenseRoutes from './expense.routes';
import printerRoutes from './printer.routes';
import reservationRoutes from './reservation.routes';
import waitlistRoutes from './waitlist.routes';

import { requireOutletAccess } from '../middleware/requireOutletAccess';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use('/auth', authRoutes);

// Apply authenticate and outlet access middleware to all routes below
router.use(authenticate);
router.use(requireOutletAccess);
router.use('/organizations', orgRoutes);
router.use('/outlets', outletRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/orders', orderRoutes);
router.use('/tables', tableRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/raw-materials', rawMaterialRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/customers', customerRoutes);
router.use('/expenses', expenseRoutes);
router.use('/printers', printerRoutes);
router.use('/reservations', reservationRoutes);
router.use('/waitlist', waitlistRoutes);

export default router;
