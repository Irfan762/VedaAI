import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vedaai';

export let isMongoFallback = false;
export const memoryStore = {
  assessments: [] as any[]
};

export default async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    isMongoFallback = false;
  } catch (error) {
    console.error('MongoDB connection error, falling back to in-memory store');
    isMongoFallback = true;
  }
}

