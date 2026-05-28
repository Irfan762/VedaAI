import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow connections from Next.js developer servers
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room specific to assessment job progress
    socket.on('join:assessment', (assessmentId: string) => {
      socket.join(assessmentId);
      console.log(`👤 Client ${socket.id} joined assessment room: ${assessmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return io;
};

export const emitJobUpdate = (assessmentId: string, data: {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  error?: string;
  result?: any;
}) => {
  if (io) {
    io.to(assessmentId).emit('assessment:update', data);
    console.log(`📢 Emitted update for ${assessmentId}: ${data.currentStep} (${data.progress}%)`);
  }
};
