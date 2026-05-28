"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisConnectionOptions = exports.getRedisClient = exports.initRedis = exports.isRedisFallback = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.isRedisFallback = false;
let redisClient = null;
const initRedis = () => {
    try {
        // Check if user has Redis host defined, else fallback to mock
        if (process.env.REDIS_HOST || process.env.REDIS_URL) {
            const host = process.env.REDIS_HOST || '127.5.5.1';
            const port = Number(process.env.REDIS_PORT) || 6379;
            redisClient = new ioredis_1.default({
                host,
                port,
                maxRetriesPerRequest: null, // Critical requirement for BullMQ
                connectTimeout: 2000
            });
            redisClient.on('error', (err) => {
                console.warn('Redis client error (Triggering mock queue fallback):', err.message);
                exports.isRedisFallback = true;
            });
            console.log(`📡 Connected to Redis: ${host}:${port}`);
            exports.isRedisFallback = false;
        }
        else {
            exports.isRedisFallback = true;
            console.log('ℹ️ Redis config omitted. Running in-memory mock queue mode.');
        }
    }
    catch (e) {
        console.error('Failed to initialize Redis connection:', e);
        exports.isRedisFallback = true;
    }
};
exports.initRedis = initRedis;
const getRedisClient = () => redisClient;
exports.getRedisClient = getRedisClient;
const getRedisConnectionOptions = () => {
    return {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null
    };
};
exports.getRedisConnectionOptions = getRedisConnectionOptions;
