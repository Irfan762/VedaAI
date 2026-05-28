import { Worker } from 'bullmq';
import { getRedisConnectionOptions, isRedisFallback } from '../config/redis';
import { Assessment } from '../models/assessment';
import { isMongoFallback, memoryStore } from '../config/db';
import { generateAssessmentAI } from '../services/ai';
import { emitJobUpdate } from '../services/socket';

// Core processing business logic (shared by BullMQ and Mock Queue)
export const processAssessmentJob = async (assessmentId: string) => {
  console.log(`👷 Processing assessment job: ${assessmentId}`);
  
  let assessment: any = null;

  // 1. Retrieve the assessment config
  if (!isMongoFallback) {
    try {
      assessment = await Assessment.findById(assessmentId);
    } catch (err) {
      console.error('Error fetching assessment from Mongo:', err);
    }
  }

  // Fallback to memoryStore
  if (!assessment) {
    assessment = memoryStore.assessments.find((a: any) => a._id === assessmentId);
  }

  if (!assessment) {
    console.error(`❌ Assessment with ID ${assessmentId} not found in DB or Memory!`);
    return;
  }

  const updateProgress = async (progress: number, step: string, status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing', errorMsg?: string, resultSections?: any) => {
    // Update local DB
    if (!isMongoFallback) {
      try {
        await Assessment.findByIdAndUpdate(assessmentId, {
          status,
          progress,
          currentStep: step,
          ...(errorMsg && { error: errorMsg }),
          ...(resultSections && { sections: resultSections })
        });
      } catch (err) {
        console.error('Error updating Mongo assessment status:', err);
      }
    } else {
      // Update memory store
      const memObj = memoryStore.assessments.find((a: any) => a._id === assessmentId);
      if (memObj) {
        memObj.status = status;
        memObj.progress = progress;
        memObj.currentStep = step;
        if (errorMsg) memObj.error = errorMsg;
        if (resultSections) memObj.sections = resultSections;
      }
    }

    // Emit Socket update
    emitJobUpdate(assessmentId, {
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

    const generatedData = await generateAssessmentAI({
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
  } catch (error: any) {
    console.error(`❌ Worker failed processing assessment ${assessmentId}:`, error);
    await updateProgress(100, 'Generation failed due to processing error.', 'failed', error.message || 'Generation error');
  }
};

// Initialize BullMQ Worker only if Redis is available
export const initializeWorker = () => {
  if (!isRedisFallback) {
    try {
      const worker = new Worker(
        'assessment-generation',
        async (job) => {
          await processAssessmentJob(job.data.assessmentId);
        },
        {
          connection: getRedisConnectionOptions(),
          concurrency: 2
        }
      );

      worker.on('completed', (job) => {
        console.log(`👷 Real worker completed job ${job.id}`);
      });

      worker.on('failed', (job, err) => {
        console.error(`👷 Real worker failed job ${job?.id}:`, err);
      });

      console.log('💚 BullMQ Worker active and polling Redis queue.');
    } catch (err) {
      console.error('Failed to start BullMQ Worker. Operating in mock queue mode.', err);
    }
  } else {
    console.log('ℹ️ Running in redis-less environment. Real BullMQ Worker bypassed (Mock Queue triggers worker tasks directly).');
  }
};
