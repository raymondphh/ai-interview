import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadCV as uploadCVMiddleware } from '../middleware/upload';
import { uploadCV, analyzeCVController, listCVs, getCV } from '../controllers/cv.controller';

const router = Router();

router.use(requireAuth);
router.get('/', listCVs);
router.get('/:id', getCV);
router.post('/upload', uploadCVMiddleware.single('cv'), uploadCV);
router.post('/:id/analyze', analyzeCVController);

export default router;
