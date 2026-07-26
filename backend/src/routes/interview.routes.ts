import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadAudio } from '../middleware/upload';
import {
  createInterview,
  getInterview,
  listInterviews,
  submitAnswer,
  completeInterview,
} from '../controllers/interview.controller';

const router = Router();

router.use(requireAuth);
router.get('/', listInterviews);
router.get('/:id', getInterview);
router.post('/', createInterview);
router.post('/:id/complete', completeInterview);
router.post('/questions/:questionId/answer', uploadAudio.single('audio'), submitAnswer);

export default router;
