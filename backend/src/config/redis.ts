import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export let isRedisFallback = false;
let redisClient: any = null;

export const initRedis = () => {
  try {
    // Check if user has Redis host defined, else fallback to mock
    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      const host = process.env.REDIS_HOST || '127.5.5.1';
      const port = Number(process.env.REDIS_PORT) || 6379;
      redisClient = new IORedis({
        host,
        port,
        maxRetriesPerRequest: null, // Critical requirement for BullMQ
        connectTimeout: 2000
      });

      redisClient.on('error', (err: any) => {
        console.warn('Redis client error (Triggering mock queue fallback):', err.message);
        isRedisFallback = true;
      });

      console.log(`📡 Connected to Redis: ${host}:${port}`);
      isRedisFallback = false;
    } else {
      isRedisFallback = true;
      console.log('ℹ️ Redis config omitted. Running in-memory mock queue mode.');
    }
  } catch (e: any) {
    console.error('Failed to initialize Redis connection:', e);
    isRedisFallback = true;
  }
};

export const getRedisClient = () => redisClient;

export const getRedisConnectionOptions = () => {
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
  };
};

