import config from '../config/env.js';
import type { AIServiceRequest, AIServiceResponse, VisualizationSpec } from '../types/index.js';

export class AIService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.aiServiceUrl;
  }

  async generateVisualization(question: string): Promise<AIServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question } as AIServiceRequest),
      });

      if (!response.ok) {
        throw new Error(`AI service responded with status: ${response.status}`);
      }

      const result = await response.json();
      return result as AIServiceResponse;
    } catch (error) {
      console.error('Error calling AI service:', error);
      throw error;
    }
  }

  createErrorVisualization(): VisualizationSpec {
    return {
      id: 'error_vis',
      duration: 3000,
      fps: 30,
      layers: [{
        id: 'error_text',
        type: 'text',
        props: { x: 200, y: 200, text: 'Error', fill: '#ff0000' },
        animations: []
      }]
    };
  }
}

export const aiService = new AIService();
