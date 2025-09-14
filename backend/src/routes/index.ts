import { Router } from 'express';
import questionRoutes from './questions.js';
import answerRoutes from './answers.js';

const router = Router();

// Mount sub-routes
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);

export default router;
