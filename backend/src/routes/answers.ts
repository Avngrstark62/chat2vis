import { Router } from 'express';
import { answerController } from '../controllers/answerController.js';

const router = Router();

// GET /api/answers/:id - Get answer by ID
router.get('/:id', answerController.getAnswerById.bind(answerController));

export default router;
