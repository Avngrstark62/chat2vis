import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

export interface Question {
  questionId: string;
  userId: string;
  question: string;
  createdAt: string;
  answerId: string;
}

export interface Answer {
  answerId: string;
  questionId: string;
  text: string;
  visualization: VisualizationSpec;
  createdAt: string;
}

export interface VisualizationSpec {
  id: string;
  duration: number;
  fps: number;
  layers: Layer[];
}

export interface Layer {
  id: string;
  type: 'circle' | 'rect' | 'arrow' | 'line' | 'text';
  props: Record<string, any>;
  animations?: Animation[];
}

export interface Animation {
  property: string;
  from: number;
  to: number;
  start: number;
  end: number;
  centerX?: number;
  centerY?: number;
  radius?: number;
  clockwise?: boolean;
}

export const submitQuestion = async (userId: string, question: string) => {
  const response = await axios.post(`${API_BASE_URL}/questions`, {
    userId,
    question
  });
  
  return response.data;
};

export const getQuestions = async (): Promise<Question[]> => {
  const response = await axios.get(`${API_BASE_URL}/questions`);
  
  return response.data;
};

export const getAnswer = async (answerId: string): Promise<Answer> => {
  const response = await axios.get(`${API_BASE_URL}/answers/${answerId}`);
  
  return response.data;
};
