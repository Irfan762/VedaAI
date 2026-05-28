import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import assessmentRoutes from './routes/assessment';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Dynamic client URL allowed for dev ease
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/assessments', assessmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

export default app;
