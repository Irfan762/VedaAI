import { Request, Response } from 'express';
import { z } from 'zod';
import { Assessment } from '../models/assessment';
import { isMongoFallback, memoryStore } from '../config/db';
import { addAssessmentJob } from '../queues/assessmentQueue';

const CreateAssessmentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  subject: z.string().min(2, 'Subject must be at least 2 characters'),
  dueDate: z.string().optional(),
  questionType: z.array(z.enum(['mcq', 'short', 'diagram', 'numerical'])).min(1, 'Select at least one question type'),
  totalQuestions: z.number().int().min(1, 'Minimum 1 question').max(50, 'Maximum 50 questions'),
  totalMarks: z.number().int().min(1, 'Minimum 1 mark').max(200, 'Maximum 200 marks'),
  additionalInstructions: z.string().optional()
});

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const validatedData = CreateAssessmentSchema.parse(req.body);
    
    let newAssessment: any;

    if (!isMongoFallback) {
      newAssessment = await Assessment.create({
        ...validatedData,
        status: 'pending',
        progress: 0,
        currentStep: 'Added to Queue',
        sections: []
      });
    } else {
      // Memory store creation
      const mockId = 'mock_ass_' + Math.random().toString(36).substring(2, 9);
      newAssessment = {
        _id: mockId,
        id: mockId,
        ...validatedData,
        status: 'pending',
        progress: 0,
        currentStep: 'Added to Queue',
        sections: [],
        createdAt: new Date()
      };
      memoryStore.assessments.unshift(newAssessment);
    }

    // Push background processing job
    const assessmentId = newAssessment._id.toString();
    await addAssessmentJob(assessmentId);

    return res.status(201).json({
      success: true,
      message: 'Assessment creation scheduled successfully',
      assessment: newAssessment
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(e => e.message)
      });
    }
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};

export const getAssessmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let assessment: any = null;

    if (!isMongoFallback) {
      assessment = await Assessment.findById(id);
    } else {
      assessment = memoryStore.assessments.find((a: any) => a._id === id);
    }

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    return res.json({
      success: true,
      assessment
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};

export const getAllAssessments = async (req: Request, res: Response) => {
  try {
    let assessments: any[] = [];

    if (!isMongoFallback) {
      assessments = await Assessment.find().sort({ createdAt: -1 });
    } else {
      assessments = [...memoryStore.assessments];
    }

    return res.json({
      success: true,
      count: assessments.length,
      assessments
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};

export const regenerateAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let assessment: any = null;

    if (!isMongoFallback) {
      assessment = await Assessment.findById(id);
    } else {
      assessment = memoryStore.assessments.find((a: any) => a._id === id);
    }

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Reset status & progress
    if (!isMongoFallback) {
      await Assessment.findByIdAndUpdate(id, {
        status: 'pending',
        progress: 0,
        currentStep: 'Re-added to Queue',
        sections: [],
        error: undefined
      });
    } else {
      assessment.status = 'pending';
      assessment.progress = 0;
      assessment.currentStep = 'Re-added to Queue';
      assessment.sections = [];
      assessment.error = undefined;
    }

    // Queue regeneration
    await addAssessmentJob(id);

    return res.json({
      success: true,
      message: 'Regeneration scheduled successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};

export const deleteAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let deleted = false;

    if (!isMongoFallback) {
      const result = await Assessment.findByIdAndDelete(id);
      if (result) deleted = true;
    } else {
      const initialLength = memoryStore.assessments.length;
      memoryStore.assessments = memoryStore.assessments.filter((a: any) => a._id !== id);
      if (memoryStore.assessments.length < initialLength) deleted = true;
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    return res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};
