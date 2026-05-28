"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAssessment = exports.regenerateAssessment = exports.getAllAssessments = exports.getAssessmentById = exports.createAssessment = void 0;
const zod_1 = require("zod");
const assessment_1 = require("../models/assessment");
const db_1 = require("../config/db");
const assessmentQueue_1 = require("../queues/assessmentQueue");
const CreateAssessmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Title must be at least 2 characters'),
    subject: zod_1.z.string().min(2, 'Subject must be at least 2 characters'),
    dueDate: zod_1.z.string().optional(),
    questionType: zod_1.z.array(zod_1.z.enum(['mcq', 'short', 'diagram', 'numerical'])).min(1, 'Select at least one question type'),
    totalQuestions: zod_1.z.number().int().min(1, 'Minimum 1 question').max(50, 'Maximum 50 questions'),
    totalMarks: zod_1.z.number().int().min(1, 'Minimum 1 mark').max(200, 'Maximum 200 marks'),
    additionalInstructions: zod_1.z.string().optional()
});
const createAssessment = async (req, res) => {
    try {
        const validatedData = CreateAssessmentSchema.parse(req.body);
        let newAssessment;
        if (!db_1.isMongoFallback) {
            newAssessment = await assessment_1.Assessment.create({
                ...validatedData,
                status: 'pending',
                progress: 0,
                currentStep: 'Added to Queue',
                sections: []
            });
        }
        else {
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
            db_1.memoryStore.assessments.unshift(newAssessment);
        }
        // Push background processing job
        const assessmentId = newAssessment._id.toString();
        await (0, assessmentQueue_1.addAssessmentJob)(assessmentId);
        return res.status(201).json({
            success: true,
            message: 'Assessment creation scheduled successfully',
            assessment: newAssessment
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
exports.createAssessment = createAssessment;
const getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        let assessment = null;
        if (!db_1.isMongoFallback) {
            assessment = await assessment_1.Assessment.findById(id);
        }
        else {
            assessment = db_1.memoryStore.assessments.find((a) => a._id === id);
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.getAssessmentById = getAssessmentById;
const getAllAssessments = async (req, res) => {
    try {
        let assessments = [];
        if (!db_1.isMongoFallback) {
            assessments = await assessment_1.Assessment.find().sort({ createdAt: -1 });
        }
        else {
            assessments = [...db_1.memoryStore.assessments];
        }
        return res.json({
            success: true,
            count: assessments.length,
            assessments
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.getAllAssessments = getAllAssessments;
const regenerateAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        let assessment = null;
        if (!db_1.isMongoFallback) {
            assessment = await assessment_1.Assessment.findById(id);
        }
        else {
            assessment = db_1.memoryStore.assessments.find((a) => a._id === id);
        }
        if (!assessment) {
            return res.status(404).json({
                success: false,
                error: 'Assessment not found'
            });
        }
        // Reset status & progress
        if (!db_1.isMongoFallback) {
            await assessment_1.Assessment.findByIdAndUpdate(id, {
                status: 'pending',
                progress: 0,
                currentStep: 'Re-added to Queue',
                sections: [],
                error: undefined
            });
        }
        else {
            assessment.status = 'pending';
            assessment.progress = 0;
            assessment.currentStep = 'Re-added to Queue';
            assessment.sections = [];
            assessment.error = undefined;
        }
        // Queue regeneration
        await (0, assessmentQueue_1.addAssessmentJob)(id);
        return res.json({
            success: true,
            message: 'Regeneration scheduled successfully'
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.regenerateAssessment = regenerateAssessment;
const deleteAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        let deleted = false;
        if (!db_1.isMongoFallback) {
            const result = await assessment_1.Assessment.findByIdAndDelete(id);
            if (result)
                deleted = true;
        }
        else {
            const initialLength = db_1.memoryStore.assessments.length;
            db_1.memoryStore.assessments = db_1.memoryStore.assessments.filter((a) => a._id !== id);
            if (db_1.memoryStore.assessments.length < initialLength)
                deleted = true;
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
};
exports.deleteAssessment = deleteAssessment;
