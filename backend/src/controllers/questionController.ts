import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { Question, Answer } from '../models.js';
import { aiService } from '../services/aiService.js';
import type { CreateQuestionRequest, CreateQuestionResponse } from '../types/index.js';

export class QuestionController {
  // POST /api/questions - Submit a new question
  async createQuestion(req: Request<{}, CreateQuestionResponse, CreateQuestionRequest>, res: Response<CreateQuestionResponse>) {
    try {
      const { userId, question } = req.body;
      
      if (!userId || !question) {
        return res.status(400).json({ error: 'userId and question are required' } as any);
      }

      // Generate IDs
      const questionId = `q_${nanoid()}`;
      const answerId = `a_${nanoid()}`;

      // Save question to database
      const questionDoc = new Question({
        questionId,
        userId,
        question,
        answerId
      });
      await questionDoc.save();

      // Call AI service asynchronously
      this.processQuestionWithAI(question, questionId, answerId);

      res.json({ questionId, answerId });
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Internal server error' } as any);
    }
  }

  // GET /api/questions - Get all questions
  async getQuestions(req: Request, res: Response) {
    try {
      const questions = await Question.find().sort({ createdAt: -1 });
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Process question with AI service (private method)
  private async processQuestionWithAI(question: string, questionId: string, answerId: string) {
    try {
      const result = await aiService.generateVisualization(question);
      
      // Save answer to database
      const answerDoc = new Answer({
        answerId,
        questionId,
        text: result.text,
        visualization: result.visualization
      });
      await answerDoc.save();

    } catch (error) {
      console.error('Error calling AI service:', error);
      
      // Save error response
      const errorAnswer = new Answer({
        answerId,
        questionId,
        text: 'Sorry, I encountered an error while processing your question. Please try again.',
        visualization: aiService.createErrorVisualization()
      });
      await errorAnswer.save();
    }
  }
}

export const questionController = new QuestionController();
