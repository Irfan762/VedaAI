"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAssessmentJob = exports.initializeQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const events_1 = __importDefault(require("events"));
// Create a robust Mock Queue Event Emitter for Redis-less local development
class MockAssessmentQueue extends events_1.default {
    async add(jobName, data) {
        console.log(`[Mock Queue] Job added: ${jobName} for assessment ${data.assessmentId}`);
        // Simulate BullMQ background execution delay and run the worker in the background
        // We defer the execution using setTimeout so the API request returns immediately
        setTimeout(async () => {
            try {
                const { processAssessmentJob } = require('../workers/assessmentWorker');
                await processAssessmentJob(data.assessmentId);
            }
            catch (error) {
                console.error('[Mock Queue] Execution error:', error);
            }
        }, 500);
        return {
            id: data.assessmentId,
            name: jobName,
            data
        };
    }
}
let realQueue = null;
let mockQueue = null;
const initializeQueue = () => {
    if (!redis_1.isRedisFallback) {
        try {
            realQueue = new bullmq_1.Queue('assessment-generation', {
                connection: (0, redis_1.getRedisConnectionOptions)()
            });
            console.log('💚 BullMQ Queue initialized successfully.');
        }
        catch (err) {
            console.error('Failed to initialize BullMQ. Activating mock queue fallback.', err);
            mockQueue = new MockAssessmentQueue();
        }
    }
    else {
        mockQueue = new MockAssessmentQueue();
    }
};
exports.initializeQueue = initializeQueue;
const addAssessmentJob = async (assessmentId) => {
    if (realQueue) {
        return await realQueue.add('generate-paper', { assessmentId });
    }
    else if (mockQueue) {
        return await mockQueue.add('generate-paper', { assessmentId });
    }
    else {
        // If not initialized yet, initialize on-demand
        (0, exports.initializeQueue)();
        return (0, exports.addAssessmentJob)(assessmentId);
    }
};
exports.addAssessmentJob = addAssessmentJob;
