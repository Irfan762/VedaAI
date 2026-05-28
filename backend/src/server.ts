import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { initRedis } from './config/redis';
import assessmentRouter from './routes/assessment';
import { initializeSocket } from './services/socket';
import { initializeWorker } from './workers/assessmentWorker';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/api/assessments', assessmentRouter);
app.get('/api/health', (req, res) => {
  console.log('API health check hit');
  res.json({ status: 'ok' });
});
// Initialize DB and Redis
app.get('/goal', (req, res) => {
  console.log('Legacy goal check hit');
  res.json({ status: 'ok' });
});
connectDB();
initRedis();

const httpServer = http.createServer(app);
initializeSocket(httpServer);

// Start the worker to process queue jobs
initializeWorker();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
