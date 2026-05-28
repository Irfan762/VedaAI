"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWorker = exports.processAssessmentJob = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const assessment_1 = require("../models/assessment");
const db_1 = require("../config/db");
const ai_1 = require("../services/ai");
const socket_1 = require("../services/socket");
// Core processing business logic (shared by BullMQ and Mock Queue)
const processAssessmentJob = async (assessmentId) => {
    console.log(`👷 Processing assessment job: ${assessmentId}`);
    let assessment = null;
    // 1. Retrieve the assessment config
    if (!db_1.isMongoFallback) {
        try {
            assessment = await assessment_1.Assessment.findById(assessmentId);
        }
        catch (err) {
            console.error('Error fetching assessment from Mongo:', err);
        }
    }
    // Fallback to memoryStore
    if (!assessment) {
        assessment = db_1.memoryStore.assessments.find((a) => a._id === assessmentId);
    }
    if (!assessment) {
        console.error(`❌ Assessment with ID ${assessmentId} not found in DB or Memory!`);
        return;
    }
    const updateProgress = async (progress, step, status = 'processing', errorMsg, resultSections) => {
        // Update local DB
        if (!db_1.isMongoFallback) {
            try {
                await assessment_1.Assessment.findByIdAndUpdate(assessmentId, {
                    status,
                    progress,
                    currentStep: step,
                    ...(errorMsg && { error: errorMsg }),
                    ...(resultSections && { sections: resultSections })
                });
            }
            catch (err) {
                console.error('Error updating Mongo assessment status:', err);
            }
        }
        else {
            // Update memory store
            const memObj = db_1.memoryStore.assessments.find((a) => a._id === assessmentId);
            if (memObj) {
                memObj.status = status;
                memObj.progress = progress;
                memObj.currentStep = step;
                if (errorMsg)
                    memObj.error = errorMsg;
                if (resultSections)
                    memObj.sections = resultSections;
            }
        }
        // Emit Socket update
        (0, socket_1.emitJobUpdate)(assessmentId, {
            status,
            progress,
            currentStep: step,
            ...(errorMsg && { error: errorMsg }),
            ...(resultSections && { result: { ...assessment.toObject?.() || assessment, sections: resultSections } })
        });
    };
    try {
        // Start Progress
        await new Promise((r) => setTimeout(r, 800)); // Visual spacing for UI demo
        await updateProgress(15, 'Reading assessment configuration & rules...');
        await new Promise((r) => setTimeout(r, 1000));
        await updateProgress(35, 'Structuring optimal prompt inputs & context...');
        await new Promise((r) => setTimeout(r, 1200));
        await updateProgress(65, 'Querying AI models & synthesizing professional questions...');
        // Distribute difficulties
        // If totalQuestions = 10, easy = 3, med = 4, hard = 3
        const easyCount = Math.round(assessment.totalQuestions * 0.3);
        const hardCount = Math.round(assessment.totalQuestions * 0.3);
        const medCount = Math.max(0, assessment.totalQuestions - easyCount - hardCount);
        const generatedData = await (0, ai_1.generateAssessmentAI)({
            title: assessment.title,
            subject: assessment.subject,
            questionTypes: assessment.questionType,
            totalQuestions: assessment.totalQuestions,
            totalMarks: assessment.totalMarks,
            difficultyDistribution: { Easy: easyCount, Medium: medCount, Hard: hardCount },
            additionalInstructions: assessment.additionalInstructions
        });
        await new Promise((r) => setTimeout(r, 800));
        await updateProgress(85, 'Parsing structured JSON & validating schema constraints...');
        if (!generatedData || !generatedData.sections || !Array.isArray(generatedData.sections)) {
            throw new Error('AI output failed to parse into valid section formats.');
        }
        await new Promise((r) => setTimeout(r, 800));
        await updateProgress(95, 'Writing exam layout & finalizing document caches...');
        await new Promise((r) => setTimeout(r, 500));
        await updateProgress(100, 'Assessment compiled successfully!', 'completed', undefined, generatedData.sections);
        console.log(`✅ Completed job successfully for assessment: ${assessmentId}`);
    }
    catch (error) {
        console.error(`❌ Worker failed processing assessment ${assessmentId}:`, error);
        await updateProgress(100, 'Generation failed due to processing error.', 'failed', error.message || 'Generation error');
    }
};
exports.processAssessmentJob = processAssessmentJob;
// Initialize BullMQ Worker only if Redis is available
const initializeWorker = () => {
    if (!redis_1.isRedisFallback) {
        try {
            const worker = new bullmq_1.Worker('assessment-generation', async (job) => {
                await (0, exports.processAssessmentJob)(job.data.assessmentId);
            }, {
                connection: (0, redis_1.getRedisConnectionOptions)(),
                concurrency: 2
            });
            worker.on('completed', (job) => {
                console.log(`👷 Real worker completed job ${job.id}`);
            });
            worker.on('failed', (job, err) => {
                console.error(`👷 Real worker failed job ${job?.id}:`, err);
            });
            console.log('💚 BullMQ Worker active and polling Redis queue.');
        }
        catch (err) {
            console.error('Failed to start BullMQ Worker. Operating in mock queue mode.', err);
        }
    }
    else {
        console.log('ℹ️ Running in redis-less environment. Real BullMQ Worker bypassed (Mock Queue triggers worker tasks directly).');
    }
};
exports.initializeWorker = initializeWorker;
