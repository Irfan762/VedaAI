"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitJobUpdate = exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
let io = null;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Allow connections from Next.js developer servers
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Join room specific to assessment job progress
        socket.on('join:assessment', (assessmentId) => {
            socket.join(assessmentId);
            console.log(`👤 Client ${socket.id} joined assessment room: ${assessmentId}`);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized yet!');
    }
    return io;
};
exports.getIO = getIO;
const emitJobUpdate = (assessmentId, data) => {
    if (io) {
        io.to(assessmentId).emit('assessment:update', data);
        console.log(`📢 Emitted update for ${assessmentId}: ${data.currentStep} (${data.progress}%)`);
    }
};
exports.emitJobUpdate = emitJobUpdate;
