import { Router } from 'express';
import { questionController } from '../controllers/questionController.js';

const router = Router();

// POST /api/questions - Submit a new question
router.post('/', questionController.createQuestion.bind(questionController));

// GET /api/questions - Get all questions
router.get('/', questionController.getQuestions.bind(questionController));

export default router;
