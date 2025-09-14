import { Request, Response } from 'express';
import { Answer } from '../models.js';

export class AnswerController {
  // GET /api/answers/:id - Get answer by ID
  async getAnswerById(req: Request, res: Response) {
    try {
        console.log('Fetching answer with ID:', req.params.id);
        // try to fetch all answers and print them for debugging
        // const answers = await Answer.find();
        // console.log('All answers:', answers);

      const answer = await Answer.findOne({ answerId: req.params.id });
      if (!answer) {
        return res.status(404).json({ error: 'Answer not found' });
      }
      console.log('Found answer:', answer);
      res.json(answer);
    } catch (error) {
      console.error('Error fetching answer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const answerController = new AnswerController();
