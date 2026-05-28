import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuestion {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  options?: string[];
  correctAnswer?: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssessment extends Document {
  title: string;
  subject: string;
  dueDate?: Date;
  questionType: string[]; // sync naming with frontend selection
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  error?: string;
  sections: ISection[];
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    dueDate: { type: Date },
    questionType: [{ type: String }],
    totalQuestions: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    additionalInstructions: { type: String },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    progress: { type: Number, default: 0 },
    currentStep: { type: String, default: 'Created' },
    error: { type: String },
    sections: [
      {
        title: { type: String },
        instruction: { type: String },
        questions: [
          {
            question: { type: String },
            difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
            marks: { type: Number },
            options: [{ type: String }],
            correctAnswer: { type: String }
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

export const Assessment: Model<IAssessment> = mongoose.model<IAssessment>('Assessment', AssessmentSchema);

