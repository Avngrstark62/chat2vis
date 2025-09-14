export interface VisualizationLayer {
  id: string;
  type: string;
  props: Record<string, any>;
  animations: any[];
}

export interface VisualizationSpec {
  id: string;
  duration: number;
  fps: number;
  layers: VisualizationLayer[];
}

export interface CreateQuestionRequest {
  userId: string;
  question: string;
}

export interface CreateQuestionResponse {
  questionId: string;
  answerId: string;
}

export interface AIServiceRequest {
  question: string;
}

export interface AIServiceResponse {
  text: string;
  visualization: VisualizationSpec;
}
