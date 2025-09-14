import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
}

export interface IQuestion extends Document {
  questionId: string;
  userId: string;
  question: string;
  createdAt: Date;
  answerId: string;
}

export interface IAnswer extends Document {
  answerId: string;
  questionId: string;
  text: string;
  visualization: object;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
});

const QuestionSchema = new Schema<IQuestion>({
  questionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  question: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  answerId: { type: String, required: true },
});

const AnswerSchema = new Schema<IAnswer>({
  answerId: { type: String, required: true, unique: true },
  questionId: { type: String, required: true },
  text: { type: String, required: true },
  visualization: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>('User', UserSchema);
export const Question = model<IQuestion>('Question', QuestionSchema);
export const Answer = model<IAnswer>('Answer', AnswerSchema);
