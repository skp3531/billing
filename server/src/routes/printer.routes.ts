import { Router } from 'express';
import { getPrinterSettings, updatePrinterSetting } from '../controllers/printer.controller';
import { authenticate } from '../middleware/authenticate';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getPrinterSettings));
router.put('/:id', asyncHandler(updatePrinterSetting));

export default router;
