"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const redis_1 = require("./config/redis");
const assessment_1 = __importDefault(require("./routes/assessment"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL }));
app.use(express_1.default.json());
app.use('/api/assessments', assessment_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Initialize DB and Redis
(0, db_1.default)();
(0, redis_1.initRedis)();
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // You can add custom events here later
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
