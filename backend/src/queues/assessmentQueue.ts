import { Queue } from 'bullmq';
import { getRedisConnectionOptions, isRedisFallback } from '../config/redis';
import EventEmitter from 'events';

// Create a robust Mock Queue Event Emitter for Redis-less local development
class MockAssessmentQueue extends EventEmitter {
  async add(jobName: string, data: { assessmentId: string }) {
    console.log(`[Mock Queue] Job added: ${jobName} for assessment ${data.assessmentId}`);
    
    // Simulate BullMQ background execution delay and run the worker in the background
    // We defer the execution using setTimeout so the API request returns immediately
    setTimeout(async () => {
      try {
        const { processAssessmentJob } = require('../workers/assessmentWorker');
        await processAssessmentJob(data.assessmentId);
      } catch (error) {
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

let realQueue: Queue | null = null;
let mockQueue: MockAssessmentQueue | null = null;

export const initializeQueue = () => {
  if (!isRedisFallback) {
    try {
      realQueue = new Queue('assessment-generation', {
        connection: getRedisConnectionOptions()
      });
      console.log('💚 BullMQ Queue initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize BullMQ. Activating mock queue fallback.', err);
      mockQueue = new MockAssessmentQueue();
    }
  } else {
    mockQueue = new MockAssessmentQueue();
  }
};

export const addAssessmentJob = async (assessmentId: string): Promise<any> => {
  if (realQueue) {
    return await realQueue.add('generate-paper', { assessmentId });
  } else if (mockQueue) {
    return await mockQueue.add('generate-paper', { assessmentId });
  } else {
    // If not initialized yet, initialize on-demand
    initializeQueue();
    return addAssessmentJob(assessmentId);
  }
};
