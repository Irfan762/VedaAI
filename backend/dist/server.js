"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const redis_1 = require("./config/redis");
const assessment_1 = __importDefault(require("./routes/assessment"));
const socket_1 = require("./services/socket");
const assessmentWorker_1 = require("./workers/assessmentWorker");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL }));
app.use(express_1.default.json());
app.use('/api/assessments', assessment_1.default);
app.get('/api/health', (req, res) => {
    console.log('API health check hit');
    res.json({ status: 'ok' });
});
// Root endpoint for browser visits
app.get('/', (req, res) => {
    res.json({ message: 'VedaAI Backend is running!' });
});
// Legacy health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
(0, db_1.default)();
(0, redis_1.initRedis)();
const httpServer = http_1.default.createServer(app);
(0, socket_1.initializeSocket)(httpServer);
// Start the worker to process queue jobs
(0, assessmentWorker_1.initializeWorker)();
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
